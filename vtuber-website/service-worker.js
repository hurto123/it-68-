// ================================================
// VTuber Studio - Service Worker
// PWA Offline Support & Caching
// ================================================

const CACHE_NAME = 'vtuber-studio-v1.0.0';
const RUNTIME_CACHE = 'vtuber-runtime-v1.0.0';

// Files to cache immediately on install
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/characters.html',
    '/music.html',
    '/shop.html',
    '/gallery.html',
    '/schedule.html',
    '/about.html',
    '/login.html',
    '/css/style.css',
    '/css/responsive.css',
    '/css/dark-mode.css',
    '/css/animations.css',
    '/css/particles.css',
    '/css/admin.css',
    '/css/login.css',
    '/js/db.js',
    '/js/security.js',
    '/js/language.js',
    '/js/particles.js',
    '/js/main.js',
    '/js/login.js',
    '/manifest.json',
    '/assets/images/logo.png',
    '/assets/images/favicon-32x32.png',
    '/assets/images/favicon-16x16.png'
];

// ================================================
// Install Event - Cache Essential Files
// ================================================

self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching essential files');
                return cache.addAll(PRECACHE_URLS);
            })
            .then(() => {
                console.log('Service Worker: Installed successfully');
                return self.skipWaiting(); // Activate immediately
            })
            .catch((error) => {
                console.error('Service Worker: Installation failed', error);
            })
    );
});

// ================================================
// Activate Event - Clean Up Old Caches
// ================================================

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                            console.log('Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated successfully');
                return self.clients.claim(); // Take control immediately
            })
    );
});

// ================================================
// Fetch Event - Serve Cached Files or Fetch New
// ================================================

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }
    
    // Skip Chrome extensions
    if (url.protocol === 'chrome-extension:') {
        return;
    }
    
    // Handle different request types
    if (request.method === 'GET') {
        event.respondWith(
            cacheFirstStrategy(request)
        );
    }
});

// ================================================
// Caching Strategies
// ================================================

// Cache First Strategy - Try cache first, then network
async function cacheFirstStrategy(request) {
    try {
        // Try to get from cache first
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            console.log('Service Worker: Serving from cache:', request.url);
            return cachedResponse;
        }
        
        // If not in cache, fetch from network
        console.log('Service Worker: Fetching from network:', request.url);
        const networkResponse = await fetch(request);
        
        // Cache the new response for next time
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.error('Service Worker: Fetch failed', error);
        
        // Return offline fallback page if available
        const offlinePage = await caches.match('/offline.html');
        if (offlinePage) {
            return offlinePage;
        }
        
        // Or return a custom offline response
        return new Response('Offline - Please check your internet connection', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'text/plain'
            })
        });
    }
}

// Network First Strategy - Try network first, fallback to cache
async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.log('Service Worker: Network failed, trying cache');
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

// ================================================
// Background Sync
// ================================================

self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync', event.tag);
    
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    try {
        // Sync any pending data when online
        console.log('Service Worker: Syncing data...');
        
        // Add your sync logic here
        
        return Promise.resolve();
    } catch (error) {
        console.error('Service Worker: Sync failed', error);
        return Promise.reject(error);
    }
}

// ================================================
// Push Notifications
// ================================================

self.addEventListener('push', (event) => {
    console.log('Service Worker: Push notification received');
    
    let notificationData = {
        title: 'VTuber Studio',
        body: 'You have a new notification',
        icon: '/assets/images/icons/icon-192x192.png',
        badge: '/assets/images/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
        tag: 'notification',
        requireInteraction: false
    };
    
    if (event.data) {
        try {
            notificationData = event.data.json();
        } catch (e) {
            notificationData.body = event.data.text();
        }
    }
    
    event.waitUntil(
        self.registration.showNotification(notificationData.title, {
            body: notificationData.body,
            icon: notificationData.icon,
            badge: notificationData.badge,
            vibrate: notificationData.vibrate,
            tag: notificationData.tag,
            requireInteraction: notificationData.requireInteraction,
            data: {
                url: notificationData.url || '/'
            }
        })
    );
});

// ================================================
// Notification Click
// ================================================

self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked');
    
    event.notification.close();
    
    const urlToOpen = event.notification.data?.url || '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if there's already a window open
                for (const client of clientList) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // Open new window
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// ================================================
// Message Handler
// ================================================

self.addEventListener('message', (event) => {
    console.log('Service Worker: Message received', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            })
        );
    }
});

// ================================================
// Periodic Background Sync (Experimental)
// ================================================

self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'update-content') {
        event.waitUntil(updateContent());
    }
});

async function updateContent() {
    console.log('Service Worker: Updating content...');
    
    try {
        // Fetch and cache latest content
        const cache = await caches.open(RUNTIME_CACHE);
        
        const urlsToUpdate = [
            '/index.html',
            '/characters.html',
            '/music.html',
            '/shop.html'
        ];
        
        await Promise.all(
            urlsToUpdate.map(async (url) => {
                const response = await fetch(url);
                if (response.ok) {
                    await cache.put(url, response);
                }
            })
        );
        
        console.log('Service Worker: Content updated successfully');
    } catch (error) {
        console.error('Service Worker: Content update failed', error);
    }
}

console.log('✅ Service Worker: Script loaded');
