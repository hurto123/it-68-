// ================================================
// VTuber Studio - Security & Authentication
// ================================================

'use strict';

const Security = {
    // Security settings
    config: {
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000, // 15 minutes
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        passwordMinLength: 8,
        requireStrongPassword: true
    },
    
    // ================================================
    // Password Hashing
    // ================================================
    
    async hashPassword(password, salt = null) {
        if (!salt) {
            salt = this.generateSalt();
        }
        
        const encoder = new TextEncoder();
        const data = encoder.encode(password + salt);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        return {
            hash: hashHex,
            salt: salt
        };
    },
    
    async verifyPassword(password, storedHash, salt) {
        const result = await this.hashPassword(password, salt);
        return result.hash === storedHash;
    },
    
    generateSalt() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    },
    
    // ================================================
    // Password Validation
    // ================================================
    
    validatePassword(password) {
        const errors = [];
        
        if (password.length < this.config.passwordMinLength) {
            errors.push(`Password must be at least ${this.config.passwordMinLength} characters`);
        }
        
        if (this.config.requireStrongPassword) {
            if (!/[A-Z]/.test(password)) {
                errors.push('Password must contain at least one uppercase letter');
            }
            if (!/[a-z]/.test(password)) {
                errors.push('Password must contain at least one lowercase letter');
            }
            if (!/[0-9]/.test(password)) {
                errors.push('Password must contain at least one number');
            }
            if (!/[!@#$%^&*]/.test(password)) {
                errors.push('Password must contain at least one special character (!@#$%^&*)');
            }
        }
        
        return {
            valid: errors.length === 0,
            errors: errors,
            strength: this.calculatePasswordStrength(password)
        };
    },
    
    calculatePasswordStrength(password) {
        let strength = 0;
        
        if (password.length >= 8) strength += 20;
        if (password.length >= 12) strength += 20;
        if (/[a-z]/.test(password)) strength += 15;
        if (/[A-Z]/.test(password)) strength += 15;
        if (/[0-9]/.test(password)) strength += 15;
        if (/[!@#$%^&*]/.test(password)) strength += 15;
        
        if (strength <= 40) return 'weak';
        if (strength <= 70) return 'medium';
        return 'strong';
    },
    
    // ================================================
    // Authentication
    // ================================================
    
    async login(username, password) {
        // Check if account is locked
        if (this.isAccountLocked(username)) {
            const lockTime = this.getLockoutTime(username);
            const remainingTime = Math.ceil((lockTime - Date.now()) / 1000 / 60);
            return {
                success: false,
                error: `Account locked. Try again in ${remainingTime} minutes.`
            };
        }
        
        // Get stored admin credentials
        const admin = DB.get('admin');
        
        if (!admin) {
            // First time setup - create default admin
            await this.createDefaultAdmin();
            return this.login(username, password);
        }
        
        // Verify credentials
        const isValid = await this.verifyPassword(password, admin.passwordHash, admin.salt);
        
        if (isValid && username === admin.username) {
            // Clear login attempts
            this.clearLoginAttempts(username);
            
            // Create session
            const session = this.createSession(admin);
            
            // Log activity
            DB.addActivity({
                type: 'login',
                username: username,
                success: true
            });
            
            return {
                success: true,
                session: session
            };
        } else {
            // Increment login attempts
            this.incrementLoginAttempts(username);
            
            // Log failed attempt
            DB.addActivity({
                type: 'login',
                username: username,
                success: false
            });
            
            const attempts = this.getLoginAttempts(username);
            const remaining = this.config.maxLoginAttempts - attempts;
            
            if (remaining <= 0) {
                this.lockAccount(username);
                return {
                    success: false,
                    error: 'Too many failed attempts. Account locked for 15 minutes.'
                };
            }
            
            return {
                success: false,
                error: `Invalid credentials. ${remaining} attempts remaining.`
            };
        }
    },
    
    logout() {
        sessionStorage.removeItem('vtuber_session');
        
        DB.addActivity({
            type: 'logout',
            timestamp: new Date().toISOString()
        });
        
        return { success: true };
    },
    
    async createDefaultAdmin() {
        const defaultPassword = 'admin123';
        const hashed = await this.hashPassword(defaultPassword);
        
        const admin = {
            username: 'admin',
            passwordHash: hashed.hash,
            salt: hashed.salt,
            createdAt: new Date().toISOString()
        };
        
        DB.set('admin', admin);
        console.log('Default admin created: admin/admin123');
    },
    
    async changePassword(oldPassword, newPassword) {
        const admin = DB.get('admin');
        
        // Verify old password
        const isValid = await this.verifyPassword(oldPassword, admin.passwordHash, admin.salt);
        
        if (!isValid) {
            return {
                success: false,
                error: 'Current password is incorrect'
            };
        }
        
        // Validate new password
        const validation = this.validatePassword(newPassword);
        if (!validation.valid) {
            return {
                success: false,
                error: validation.errors.join(', ')
            };
        }
        
        // Hash new password
        const hashed = await this.hashPassword(newPassword);
        
        admin.passwordHash = hashed.hash;
        admin.salt = hashed.salt;
        admin.updatedAt = new Date().toISOString();
        
        DB.set('admin', admin);
        
        DB.addActivity({
            type: 'password_change',
            timestamp: new Date().toISOString()
        });
        
        return { success: true };
    },
    
    // ================================================
    // Session Management
    // ================================================
    
    createSession(admin) {
        const session = {
            username: admin.username,
            token: this.generateToken(),
            createdAt: Date.now(),
            expiresAt: Date.now() + this.config.sessionTimeout
        };
        
        sessionStorage.setItem('vtuber_session', JSON.stringify(session));
        
        return session;
    },
    
    getSession() {
        try {
            const sessionData = sessionStorage.getItem('vtuber_session');
            if (!sessionData) return null;
            
            const session = JSON.parse(sessionData);
            
            // Check if session expired
            if (Date.now() > session.expiresAt) {
                this.logout();
                return null;
            }
            
            // Extend session
            session.expiresAt = Date.now() + this.config.sessionTimeout;
            sessionStorage.setItem('vtuber_session', JSON.stringify(session));
            
            return session;
        } catch (error) {
            console.error('Error getting session:', error);
            return null;
        }
    },
    
    isAuthenticated() {
        const session = this.getSession();
        return session !== null;
    },
    
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },
    
    generateToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    },
    
    // ================================================
    // Login Attempts & Account Lockout
    // ================================================
    
    getLoginAttempts(username) {
        const attempts = localStorage.getItem(`login_attempts_${username}`);
        return attempts ? parseInt(attempts) : 0;
    },
    
    incrementLoginAttempts(username) {
        const attempts = this.getLoginAttempts(username) + 1;
        localStorage.setItem(`login_attempts_${username}`, attempts.toString());
    },
    
    clearLoginAttempts(username) {
        localStorage.removeItem(`login_attempts_${username}`);
        localStorage.removeItem(`lockout_time_${username}`);
    },
    
    lockAccount(username) {
        const lockoutTime = Date.now() + this.config.lockoutDuration;
        localStorage.setItem(`lockout_time_${username}`, lockoutTime.toString());
    },
    
    isAccountLocked(username) {
        const lockTime = this.getLockoutTime(username);
        return lockTime && Date.now() < lockTime;
    },
    
    getLockoutTime(username) {
        const lockTime = localStorage.getItem(`lockout_time_${username}`);
        return lockTime ? parseInt(lockTime) : null;
    },
    
    // ================================================
    // Input Sanitization
    // ================================================
    
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        // Remove HTML tags
        let sanitized = input.replace(/<[^>]*>/g, '');
        
        // Encode special characters
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;'
        };
        
        sanitized = sanitized.replace(/[&<>"'/]/g, char => map[char]);
        
        return sanitized;
    },
    
    sanitizeObject(obj) {
        const sanitized = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                sanitized[key] = typeof obj[key] === 'string' 
                    ? this.sanitizeInput(obj[key]) 
                    : obj[key];
            }
        }
        return sanitized;
    },
    
    // ================================================
    // XSS Protection
    // ================================================
    
    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },
    
    // ================================================
    // CSRF Protection
    // ================================================
    
    generateCSRFToken() {
        const token = this.generateToken();
        sessionStorage.setItem('csrf_token', token);
        return token;
    },
    
    getCSRFToken() {
        return sessionStorage.getItem('csrf_token');
    },
    
    validateCSRFToken(token) {
        return token === this.getCSRFToken();
    },
    
    // ================================================
    // Data Encryption (Simple AES-like)
    // ================================================
    
    encryptData(data, key = 'vtuber_secret_key') {
        try {
            const jsonString = JSON.stringify(data);
            let encrypted = '';
            
            for (let i = 0; i < jsonString.length; i++) {
                const charCode = jsonString.charCodeAt(i);
                const keyChar = key.charCodeAt(i % key.length);
                encrypted += String.fromCharCode(charCode ^ keyChar);
            }
            
            return btoa(encrypted);
        } catch (error) {
            console.error('Encryption error:', error);
            return null;
        }
    },
    
    decryptData(encryptedData, key = 'vtuber_secret_key') {
        try {
            const encrypted = atob(encryptedData);
            let decrypted = '';
            
            for (let i = 0; i < encrypted.length; i++) {
                const charCode = encrypted.charCodeAt(i);
                const keyChar = key.charCodeAt(i % key.length);
                decrypted += String.fromCharCode(charCode ^ keyChar);
            }
            
            return JSON.parse(decrypted);
        } catch (error) {
            console.error('Decryption error:', error);
            return null;
        }
    },
    
    // ================================================
    // Rate Limiting
    // ================================================
    
    checkRateLimit(action, maxAttempts = 10, timeWindow = 60000) {
        const key = `rate_limit_${action}`;
        const now = Date.now();
        
        let attempts = JSON.parse(localStorage.getItem(key) || '[]');
        
        // Remove old attempts outside time window
        attempts = attempts.filter(timestamp => now - timestamp < timeWindow);
        
        if (attempts.length >= maxAttempts) {
            return {
                allowed: false,
                retryAfter: Math.ceil((attempts[0] + timeWindow - now) / 1000)
            };
        }
        
        attempts.push(now);
        localStorage.setItem(key, JSON.stringify(attempts));
        
        return { allowed: true };
    },
    
    // ================================================
    // Content Security
    // ================================================
    
    validateFileType(file, allowedTypes) {
        const fileType = file.type;
        const fileExt = file.name.split('.').pop().toLowerCase();
        
        const typeAllowed = allowedTypes.some(type => {
            if (type.includes('*')) {
                return fileType.startsWith(type.split('*')[0]);
            }
            return fileType === type;
        });
        
        return typeAllowed;
    },
    
    validateFileSize(file, maxSize) {
        return file.size <= maxSize;
    },
    
    // ================================================
    // Word Filter for Chat
    // ================================================
    
    badWords: [
        // Add inappropriate words here
        'spam', 'scam', 'hack'
    ],
    
    filterMessage(message) {
        let filtered = message;
        
        this.badWords.forEach(word => {
            const regex = new RegExp(word, 'gi');
            filtered = filtered.replace(regex, '*'.repeat(word.length));
        });
        
        return filtered;
    },
    
    containsBadWords(message) {
        return this.badWords.some(word => 
            message.toLowerCase().includes(word.toLowerCase())
        );
    },
    
    // ================================================
    // URL Validation
    // ================================================
    
    isValidURL(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    },
    
    isWhitelistedURL(url) {
        const whitelist = [
            'youtube.com',
            'youtu.be',
            'twitter.com',
            'discord.gg'
        ];
        
        try {
            const urlObj = new URL(url);
            return whitelist.some(domain => urlObj.hostname.includes(domain));
        } catch {
            return false;
        }
    },
    
    // ================================================
    // Security Monitoring
    // ================================================
    
    logSecurityEvent(event) {
        const events = JSON.parse(localStorage.getItem('security_events') || '[]');
        
        events.push({
            ...event,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        });
        
        // Keep only last 100 events
        if (events.length > 100) {
            events.shift();
        }
        
        localStorage.setItem('security_events', JSON.stringify(events));
    },
    
    getSecurityEvents() {
        return JSON.parse(localStorage.getItem('security_events') || '[]');
    },
    
    // ================================================
    // Data Integrity Check
    // ================================================
    
    generateChecksum(data) {
        const str = JSON.stringify(data);
        let hash = 0;
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        return hash.toString(16);
    },
    
    verifyChecksum(data, checksum) {
        return this.generateChecksum(data) === checksum;
    }
};

// Initialize security
Security.generateCSRFToken();

// Make Security available globally
window.Security = Security;

console.log('🔒 Security system initialized');
