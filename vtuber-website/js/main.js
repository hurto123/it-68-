// ================================================
// VTuber Studio - Main JavaScript
// ================================================

'use strict';

// Global State
const App = {
    currentLang: 'th',
    theme: 'light',
    isLoading: true,
    cartItems: [],
    favorites: [],
    settings: {}
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // Load settings
    loadSettings();
    
    // Initialize components
    initNavigation();
    initThemeToggle();
    initLanguageToggle();
    initLoadingScreen();
    initScrollEffects();
    initCarousel();
    initAnimations();
    initCookieBanner();
    initNewsletterForm();
    initVideoControls();
    initStatsCounter();
    initCart();
    
    // Check for character voice greeting
    playWelcomeVoice();
    
    // Hide loading screen
    setTimeout(() => {
        hideLoadingScreen();
    }, 1000);
}

// ================================================
// Settings Management
// ================================================

function loadSettings() {
    try {
        const savedLang = localStorage.getItem('vtuber_lang') || 'th';
        const savedTheme = localStorage.getItem('vtuber_theme') || 'light';
        
        App.currentLang = savedLang;
        App.theme = savedTheme;
        
        // Apply theme
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Apply language
        updateLanguage(savedLang);
        
        // Load cart
        const savedCart = localStorage.getItem('vtuber_cart');
        if (savedCart) {
            App.cartItems = JSON.parse(savedCart);
            updateCartCount();
        }
        
        // Load favorites
        const savedFavorites = localStorage.getItem('vtuber_favorites');
        if (savedFavorites) {
            App.favorites = JSON.parse(savedFavorites);
        }
        
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

function saveSettings() {
    try {
        localStorage.setItem('vtuber_lang', App.currentLang);
        localStorage.setItem('vtuber_theme', App.theme);
        localStorage.setItem('vtuber_cart', JSON.stringify(App.cartItems));
        localStorage.setItem('vtuber_favorites', JSON.stringify(App.favorites));
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

// ================================================
// Loading Screen
// ================================================

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        App.isLoading = false;
    }
}

// ================================================
// Navigation
// ================================================

function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navbar = document.getElementById('navbar');
    
    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
    
    // Navbar scroll effect
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
    
    // Set active link based on current page
    setActiveNavLink();
}

function setActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ================================================
// Theme Toggle
// ================================================

function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            toggleTheme();
        });
    }
}

function toggleTheme() {
    App.theme = App.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', App.theme);
    saveSettings();
    
    // Show toast
    showToast(
        App.theme === 'dark' ? 'Dark mode enabled' : 'Light mode enabled',
        'info'
    );
}

// ================================================
// Language Toggle
// ================================================

function initLanguageToggle() {
    const langToggle = document.getElementById('lang-toggle');
    
    if (langToggle) {
        // Set initial text
        langToggle.querySelector('.lang-text').textContent = App.currentLang.toUpperCase();
        
        langToggle.addEventListener('click', () => {
            toggleLanguage();
        });
    }
}

function toggleLanguage() {
    App.currentLang = App.currentLang === 'th' ? 'en' : 'th';
    updateLanguage(App.currentLang);
    saveSettings();
    
    // Update button text
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
        langToggle.querySelector('.lang-text').textContent = App.currentLang.toUpperCase();
    }
    
    showToast(
        App.currentLang === 'th' ? 'เปลี่ยนเป็นภาษาไทย' : 'Changed to English',
        'info'
    );
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
// Scroll Effects
// ================================================

function initScrollEffects() {
    // Back to top button
    const backToTopBtn = document.getElementById('back-to-top');
    
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });
        
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Scroll progress bar (optional)
    updateScrollProgress();
    window.addEventListener('scroll', updateScrollProgress);
}

function updateScrollProgress() {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    
    const progressBar = document.querySelector('.scroll-progress');
    if (progressBar) {
        progressBar.style.width = scrolled + '%';
    }
}

// ================================================
// Carousel
// ================================================

function initCarousel() {
    const carousel = document.getElementById('carousel');
    if (!carousel) return;
    
    const track = document.getElementById('carousel-track');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const dotsContainer = document.getElementById('carousel-dots');
    
    // Sample slides data
    const slides = [
        { image: 'assets/images/slide1.jpg', alt: 'Slide 1' },
        { image: 'assets/images/slide2.jpg', alt: 'Slide 2' },
        { image: 'assets/images/slide3.jpg', alt: 'Slide 3' }
    ];
    
    let currentSlide = 0;
    
    // Create slides
    slides.forEach((slide, index) => {
        const slideEl = document.createElement('div');
        slideEl.className = 'carousel-slide';
        slideEl.innerHTML = `<img src="${slide.image}" alt="${slide.alt}" loading="lazy">`;
        track.appendChild(slideEl);
        
        // Create dot
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        if (index === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    
    function goToSlide(index) {
        currentSlide = index;
        const offset = -currentSlide * 100;
        track.style.transform = `translateX(${offset}%)`;
        
        // Update dots
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        goToSlide(currentSlide);
    }
    
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        goToSlide(currentSlide);
    }
    
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    // Auto-play
    setInterval(nextSlide, 5000);
}

// ================================================
// Animations
// ================================================

function initAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements with animation classes
    const animatedElements = document.querySelectorAll('.animate-fade-in, .animate-fade-in-up, .animate-fade-in-down, .animate-slide-in-left, .animate-slide-in-right');
    animatedElements.forEach(el => observer.observe(el));
}

// ================================================
// Video Controls
// ================================================

function initVideoControls() {
    const video = document.getElementById('hero-video');
    const toggleBtn = document.getElementById('video-toggle');
    const fullscreenBtn = document.getElementById('video-fullscreen');
    
    if (video && toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            if (video.paused) {
                video.play();
                toggleBtn.classList.remove('paused');
            } else {
                video.pause();
                toggleBtn.classList.add('paused');
            }
        });
    }
    
    if (video && fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            if (video.requestFullscreen) {
                video.requestFullscreen();
            } else if (video.webkitRequestFullscreen) {
                video.webkitRequestFullscreen();
            } else if (video.msRequestFullscreen) {
                video.msRequestFullscreen();
            }
        });
    }
}

// ================================================
// Stats Counter
// ================================================

function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    // Set initial counts from database or hardcoded values
    const stats = {
        'fan-count': 150000,
        'video-count': 500,
        'song-count': 50,
        'merch-count': 100
    };
    
    statNumbers.forEach(stat => {
        const id = stat.id;
        const target = stats[id] || 0;
        
        stat.setAttribute('data-count', target);
        animateCounter(stat, target);
    });
}

function animateCounter(element, target) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                let count = 0;
                const increment = target / 100;
                const duration = 2000;
                const stepTime = duration / 100;
                
                const counter = setInterval(() => {
                    count += increment;
                    if (count >= target) {
                        element.textContent = formatNumber(target);
                        clearInterval(counter);
                    } else {
                        element.textContent = formatNumber(Math.floor(count));
                    }
                }, stepTime);
                
                observer.unobserve(element);
            }
        });
    });
    
    observer.observe(element);
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ================================================
// Cart Management
// ================================================

function initCart() {
    updateCartCount();
}

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const count = App.cartItems.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = count;
        
        if (count > 0) {
            cartCount.style.display = 'flex';
        } else {
            cartCount.style.display = 'none';
        }
    }
}

function addToCart(product) {
    const existingItem = App.cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        App.cartItems.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    saveSettings();
    updateCartCount();
    
    showToast(
        App.currentLang === 'th' 
            ? `เพิ่ม ${product.name} ลงในตะกร้าแล้ว`
            : `Added ${product.name} to cart`,
        'success'
    );
}

function removeFromCart(productId) {
    App.cartItems = App.cartItems.filter(item => item.id !== productId);
    saveSettings();
    updateCartCount();
}

function clearCart() {
    App.cartItems = [];
    saveSettings();
    updateCartCount();
}

// ================================================
// Favorites/Wishlist
// ================================================

function toggleFavorite(itemId, itemType) {
    const favoriteKey = `${itemType}-${itemId}`;
    const index = App.favorites.indexOf(favoriteKey);
    
    if (index > -1) {
        App.favorites.splice(index, 1);
        showToast(
            App.currentLang === 'th' ? 'ลบออกจากรายการโปรด' : 'Removed from favorites',
            'info'
        );
    } else {
        App.favorites.push(favoriteKey);
        showToast(
            App.currentLang === 'th' ? 'เพิ่มในรายการโปรด' : 'Added to favorites',
            'success'
        );
    }
    
    saveSettings();
    return index === -1; // Return true if added, false if removed
}

function isFavorite(itemId, itemType) {
    const favoriteKey = `${itemType}-${itemId}`;
    return App.favorites.includes(favoriteKey);
}

// ================================================
// Cookie Banner
// ================================================

function initCookieBanner() {
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies');
    
    // Check if cookies were already accepted
    const cookiesAccepted = localStorage.getItem('vtuber_cookies_accepted');
    
    if (!cookiesAccepted && cookieBanner) {
        setTimeout(() => {
            cookieBanner.classList.add('visible');
        }, 2000);
    }
    
    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('vtuber_cookies_accepted', 'true');
            cookieBanner.classList.remove('visible');
        });
    }
}

// ================================================
// Newsletter Form
// ================================================

function initNewsletterForm() {
    const form = document.getElementById('newsletter-form');
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = form.querySelector('input[type="email"]').value;
            
            // Save to database (localStorage)
            saveNewsletter(email);
            
            // Show success message
            showToast(
                App.currentLang === 'th' 
                    ? 'สมัครรับข่าวสารสำเร็จ!'
                    : 'Successfully subscribed!',
                'success'
            );
            
            // Reset form
            form.reset();
        });
    }
}

function saveNewsletter(email) {
    try {
        let newsletters = JSON.parse(localStorage.getItem('vtuber_newsletters') || '[]');
        
        // Check if email already exists
        if (!newsletters.includes(email)) {
            newsletters.push(email);
            localStorage.setItem('vtuber_newsletters', JSON.stringify(newsletters));
        }
    } catch (error) {
        console.error('Error saving newsletter:', error);
    }
}

// ================================================
// Toast Notifications
// ================================================

function showToast(message, type = 'info', duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type} visible`;
    
    setTimeout(() => {
        toast.classList.remove('visible');
    }, duration);
}

// ================================================
// Welcome Voice
// ================================================

function playWelcomeVoice() {
    // Check if voice was already played in this session
    const voicePlayed = sessionStorage.getItem('vtuber_voice_played');
    
    if (!voicePlayed) {
        // Play welcome voice (optional feature)
        // const audio = new Audio('assets/audio/welcome.mp3');
        // audio.volume = 0.5;
        // audio.play().catch(err => console.log('Audio play prevented:', err));
        
        sessionStorage.setItem('vtuber_voice_played', 'true');
    }
}

// ================================================
// Live Status (Mock)
// ================================================

function updateLiveStatus() {
    const liveStatus = document.getElementById('live-status');
    if (!liveStatus) return;
    
    // Mock: Randomly set live status (in real app, this would come from API)
    const isLive = Math.random() > 0.8; // 20% chance of being live
    
    if (isLive) {
        liveStatus.classList.add('live');
        const liveText = liveStatus.querySelector('.live-text');
        if (liveText) {
            liveText.textContent = App.currentLang === 'th' ? 'กำลังไลฟ์' : 'LIVE NOW';
        }
    }
}

// Update live status every minute
setInterval(updateLiveStatus, 60000);
updateLiveStatus();

// ================================================
// Utility Functions
// ================================================

function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function formatCurrency(amount, currency = 'THB') {
    const symbols = {
        'THB': '฿',
        'USD': '$',
        'JPY': '¥'
    };
    
    return `${symbols[currency] || ''}${amount.toLocaleString()}`;
}

function formatDate(date, lang = 'th') {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    return new Date(date).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', options);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ================================================
// Keyboard Shortcuts
// ================================================

document.addEventListener('keydown', (e) => {
    // Esc key - Close modals
    if (e.key === 'Escape') {
        closeAllModals();
    }
    
    // Space key - Play/Pause video (if on music page)
    if (e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        const video = document.querySelector('video');
        if (video) {
            e.preventDefault();
            video.paused ? video.play() : video.pause();
        }
    }
});

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('active');
    });
}

// ================================================
// Error Handling
// ================================================

window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    // Log to analytics in production
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    // Log to analytics in production
});

// ================================================
// Export functions for use in other scripts
// ================================================

window.VTuberApp = {
    addToCart,
    removeFromCart,
    clearCart,
    toggleFavorite,
    isFavorite,
    showToast,
    sanitizeHTML,
    validateEmail,
    formatCurrency,
    formatDate
};

console.log('%c🎉 VTuber Studio Initialized!', 'color: #6C63FF; font-size: 20px; font-weight: bold;');
