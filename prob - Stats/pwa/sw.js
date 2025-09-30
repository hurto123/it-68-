const CACHE_NAME = 'stats-hub-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/search.js',
  '/app/command-palette.js',
  '/styles/tokens.css',
  '/styles/components.css',
  '/styles/light.css',
  '/styles/typography-access.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
