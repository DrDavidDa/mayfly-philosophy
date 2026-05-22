// Mayfly Philosophy - Service Worker
const CACHE_NAME = 'mayfly-v2';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './src/game-core.js',
  './src/share-poster.js',
  './src/audio.js',
  './vendor/gsap.min.js',
  './fonts/ZCOOLQingKeHuangYou.ttf',
  './fonts/ZCOOLKuaiLe.ttf',
  './fonts/PressStart2P.ttf',
  './output/assets/mayfly-title-hero.png',
  './output/assets/mayfly-character-banner.png',
  './output/assets/mayfly-death-postcard.png',
  './manifest.json',
  './icons/icon-192.svg',
  './icons/icon-512.svg'
].map((path) => new URL(path, self.registration.scope).toString());

// Install: pre-cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate: clear old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: cache-first, network fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          // Optionally cache new requests
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
  );
});
