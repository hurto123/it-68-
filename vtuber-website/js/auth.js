// ================================================
// VTuber Studio - Authentication System
// ================================================

'use strict';

const Auth = {
    currentUser: null,
    sessionToken: null,
    
    // Initialize
    init() {
        this.loadSession();
        console.log('🔐 Auth system initialized');
    },
    
    // Load session from storage
    loadSession() {
        this.sessionToken = localStorage.getItem('vtuber_session_token');
        const userStr = localStorage.getItem('vtuber_current_user');
        
        if (userStr) {
            try {
                this.currentUser = JSON.parse(userStr);
            } catch (e) {
                console.error('Failed to parse user data');
            }
        }
    },
    
    // Save session
    saveSession() {
        if (this.currentUser) {
            localStorage.setItem('vtuber_current_user', JSON.stringify(this.currentUser));
        }
        if (this.sessionToken) {
            localStorage.setItem('vtuber_session_token', this.sessionToken);
        }
    },
    
    // Login
    async login(username, password) {
        // Simulate API call
        await this.delay(500);
        
        // Check credentials (in production, this would be server-side)
        const users = DB.get('users') || [];
        const user = users.find(u => u.username === username);
        
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        
        const hashedPassword = await this.hashPassword(password);
        
        if (user.password !== hashedPassword) {
            return { success: false, error: 'Invalid password' };
        }
        
        // Create session
        this.currentUser = {
            id: user.id,
            username: user.username,
            role: user.role || 'user',
            email: user.email
        };
        
        this.sessionToken = this.generateToken();
        this.saveSession();
        
        // Log event
        if (window.Analytics) {
            Analytics.trackEvent('Auth', 'Login', username);
        }
        
        return { success: true, user: this.currentUser };
    },
    
    // Logout
    logout() {
        // Log event
        if (window.Analytics && this.currentUser) {
            Analytics.trackEvent('Auth', 'Logout', this.currentUser.username);
        }
        
        this.currentUser = null;
        this.sessionToken = null;
        
        localStorage.removeItem('vtuber_current_user');
        localStorage.removeItem('vtuber_session_token');
        
        console.log('🔐 User logged out');
    },
    
    // Register
    async register(userData) {
        const { username, email, password } = userData;
        
        // Validate
        if (!username || !email || !password) {
            return { success: false, error: 'All fields required' };
        }
        
        // Check if user exists
        const users = DB.get('users') || [];
        if (users.some(u => u.username === username)) {
            return { success: false, error: 'Username already exists' };
        }
        
        if (users.some(u => u.email === email)) {
            return { success: false, error: 'Email already exists' };
        }
        
        // Hash password
        const hashedPassword = await this.hashPassword(password);
        
        // Create user
        const newUser = {
            id: this.generateId(),
            username: username,
            email: email,
            password: hashedPassword,
            role: 'user',
            createdAt: Date.now()
        };
        
        users.push(newUser);
        DB.set('users', users);
        
        // Log event
        if (window.Analytics) {
            Analytics.trackEvent('Auth', 'Register', username);
        }
        
        return { success: true, user: newUser };
    },
    
    // Change Password
    async changePassword(currentPassword, newPassword) {
        if (!this.currentUser) {
            return { success: false, error: 'Not logged in' };
        }
        
        const users = DB.get('users') || [];
        const user = users.find(u => u.id === this.currentUser.id);
        
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        
        // Verify current password
        const currentHash = await this.hashPassword(currentPassword);
        if (user.password !== currentHash) {
            return { success: false, error: 'Current password incorrect' };
        }
        
        // Update password
        user.password = await this.hashPassword(newPassword);
        DB.set('users', users);
        
        return { success: true };
    },
    
    // Check if authenticated
    isAuthenticated() {
        return this.currentUser !== null && this.sessionToken !== null;
    },
    
    // Check if admin
    isAdmin() {
        return this.isAuthenticated() && this.currentUser.role === 'admin';
    },
    
    // Require auth (redirect if not authenticated)
    requireAuth(redirectUrl = '/login.html') {
        if (!this.isAuthenticated()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    },
    
    // Require admin
    requireAdmin(redirectUrl = '/index.html') {
        if (!this.isAdmin()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    },
    
    // Hash password (simple - use bcrypt in production)
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    },
    
    // Generate token
    generateToken() {
        return Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    },
    
    // Generate ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Delay helper
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Auto-initialize
if (typeof document !== 'undefined') {
    Auth.init();
}

window.Auth = Auth;

console.log('✅ Auth module loaded');
