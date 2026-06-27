const CACHE_NAME = 'zuno-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/icons/192x192.png',
  '/icons/512x512.png'
];

self.addEventListener('install', (event) => {
  // Skip waiting so this SW activates immediately, replacing the old broken one
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  // Delete all old caches (e.g. zuno-v1 with broken icon paths)
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only intercept GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

