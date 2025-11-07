// ================================================
// VTuber Studio - Notifications System
// ================================================

'use strict';

const Notifications = {
    permission: 'default',
    queue: [],
    
    // Initialize
    async init() {
        if ('Notification' in window) {
            this.permission = Notification.permission;
            
            if (this.permission === 'default') {
                // Don't auto-request, wait for user action
                console.log('🔔 Notifications available (not requested yet)');
            } else if (this.permission === 'granted') {
                console.log('🔔 Notifications enabled');
            } else {
                console.log('🔔 Notifications blocked');
            }
        } else {
            console.log('🔔 Notifications not supported');
        }
    },
    
    // Request permission
    async requestPermission() {
        if (!('Notification' in window)) {
            return false;
        }
        
        if (this.permission === 'granted') {
            return true;
        }
        
        try {
            this.permission = await Notification.requestPermission();
            
            if (this.permission === 'granted') {
                console.log('🔔 Notification permission granted');
                if (window.VTuberApp) {
                    VTuberApp.showToast('Notifications enabled!', 'success');
                }
                return true;
            } else {
                console.log('🔔 Notification permission denied');
                return false;
            }
        } catch (error) {
            console.error('Failed to request notification permission:', error);
            return false;
        }
    },
    
    // Show notification
    show(title, options = {}) {
        if (!('Notification' in window)) {
            console.log('Notifications not supported');
            return null;
        }
        
        if (this.permission !== 'granted') {
            console.log('Notification permission not granted');
            this.queue.push({ title, options });
            return null;
        }
        
        const defaultOptions = {
            icon: '/assets/images/icons/icon-192x192.png',
            badge: '/assets/images/icons/badge-72x72.png',
            vibrate: [200, 100, 200],
            requireInteraction: false
        };
        
        const notification = new Notification(title, {
            ...defaultOptions,
            ...options
        });
        
        notification.onclick = (event) => {
            event.preventDefault();
            window.focus();
            
            if (options.url) {
                window.location.href = options.url;
            }
            
            notification.close();
        };
        
        // Auto-close after 5 seconds
        setTimeout(() => {
            notification.close();
        }, 5000);
        
        console.log('🔔 Notification shown:', title);
        return notification;
    },
    
    // Show queued notifications
    showQueued() {
        if (this.permission !== 'granted' || this.queue.length === 0) {
            return;
        }
        
        this.queue.forEach(({ title, options }) => {
            this.show(title, options);
        });
        
        this.queue = [];
    },
    
    // Predefined notifications
    newStream(characterName, streamTitle) {
        this.show('🎥 New Live Stream!', {
            body: `${characterName} is now live: ${streamTitle}`,
            tag: 'new-stream',
            url: '/schedule.html'
        });
    },
    
    newProduct(productName) {
        this.show('🛍️ New Product!', {
            body: `Check out: ${productName}`,
            tag: 'new-product',
            url: '/shop.html'
        });
    },
    
    newSong(songTitle, artist) {
        this.show('🎵 New Song Released!', {
            body: `${artist} - ${songTitle}`,
            tag: 'new-song',
            url: '/music.html'
        });
    },
    
    achievementUnlocked(achievementName) {
        this.show('🏆 Achievement Unlocked!', {
            body: achievementName,
            tag: 'achievement',
            requireInteraction: true
        });
    },
    
    orderUpdate(orderNumber, status) {
        this.show('📦 Order Update', {
            body: `Order ${orderNumber} is now ${status}`,
            tag: 'order-update'
        });
    },
    
    streamReminder(characterName, minutes) {
        this.show('⏰ Stream Reminder', {
            body: `${characterName}'s stream starts in ${minutes} minutes!`,
            tag: 'stream-reminder',
            url: '/schedule.html'
        });
    }
};

// Auto-initialize
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        Notifications.init();
    });
}

window.Notifications = Notifications;

console.log('✅ Notifications module loaded');
