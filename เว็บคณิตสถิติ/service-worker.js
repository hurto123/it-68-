const CACHE_NAME = 'webkhanit-static-v1';
const PRECACHE_URLS = [
  './',
  './index.html',
  './style.css',
  './print.css',
  './manifest.json'
  './manifest.json',
  './lesson-controls.js',
  // '/assets/js/lesson-controls.js' intentionally omitted: the script lives at the
  // project root as `/lesson-controls.js`, so precaching the non-existent assets
  // path would cause the install event to reject.
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          !event.request.url.startsWith(self.location.origin)
        ) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});
