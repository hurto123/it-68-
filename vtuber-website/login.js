// ================================================
// VTuber Studio - Login Page JavaScript
// ================================================

'use strict';

document.addEventListener('DOMContentLoaded', () => {
    initLoginPage();
});

function initLoginPage() {
    initThemeToggle();
    initLanguageToggle();
    initPasswordToggle();
    initLoginForm();
    
    // Check if already logged in
    if (Security.isAuthenticated()) {
        window.location.href = 'admin.html';
    }
}

// ================================================
// Theme Toggle
// ================================================

function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('vtuber_theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('vtuber_theme', newTheme);
        });
    }
}

// ================================================
// Language Toggle
// ================================================

function initLanguageToggle() {
    const langToggle = document.getElementById('lang-toggle');
    const savedLang = localStorage.getItem('vtuber_lang') || 'th';
    
    let currentLang = savedLang;
    updateLanguage(currentLang);
    
    if (langToggle) {
        langToggle.querySelector('.lang-text').textContent = currentLang.toUpperCase();
        
        langToggle.addEventListener('click', () => {
            currentLang = currentLang === 'th' ? 'en' : 'th';
            updateLanguage(currentLang);
            langToggle.querySelector('.lang-text').textContent = currentLang.toUpperCase();
            localStorage.setItem('vtuber_lang', currentLang);
        });
    }
}

function updateLanguage(lang) {
    const elements = document.querySelectorAll('[data-lang-en][data-lang-th]');
    
    elements.forEach(el => {
        const text = el.getAttribute(`data-lang-${lang}`);
        if (text) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = text;
            } else {
                el.textContent = text;
            }
        }
    });
}

// ================================================
// Password Toggle
// ================================================

function initPasswordToggle() {
    const toggleBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    
    if (toggleBtn && passwordInput) {
        toggleBtn.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            
            const eyeIcon = toggleBtn.querySelector('.eye-icon');
            const eyeOffIcon = toggleBtn.querySelector('.eye-off-icon');
            
            if (type === 'password') {
                eyeIcon.style.display = 'block';
                eyeOffIcon.style.display = 'none';
            } else {
                eyeIcon.style.display = 'none';
                eyeOffIcon.style.display = 'block';
            }
        });
    }
}

// ================================================
// Login Form
// ================================================

function initLoginForm() {
    const form = document.getElementById('login-form');
    
    if (form) {
        form.addEventListener('submit', handleLogin);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    const submitBtn = document.querySelector('.btn-login');
    const errorDiv = document.getElementById('login-error');
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    hideError();
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
        const result = await Security.login(username, password);
        
        if (result.success) {
            // Save remember me preference
            if (rememberMe) {
                localStorage.setItem('vtuber_remember', 'true');
            }
            
            // Success animation
            submitBtn.classList.remove('loading');
            submitBtn.classList.add('success');
            
            // Redirect to admin panel
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 500);
        } else {
            // Show error
            showError(result.error);
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    } catch (error) {
        showError('An error occurred. Please try again.');
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

function showError(message) {
    const errorDiv = document.getElementById('login-error');
    const errorMessage = document.getElementById('error-message');
    
    if (errorDiv && errorMessage) {
        errorMessage.textContent = message;
        errorDiv.style.display = 'flex';
    }
}

function hideError() {
    const errorDiv = document.getElementById('login-error');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

console.log('🔐 Login page initialized');
