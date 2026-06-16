// Mayfly Philosophy - Service Worker
const CACHE_NAME = 'mayfly-v8';
// CACHE_NAME = 'mayfly-v4'

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
  './output/assets/mayfly-title-hero.webp',
  './output/assets/mayfly-character-banner.webp',
  './output/assets/mayfly-character-portrait.webp',
  './output/assets/mayfly-death-postcard.webp',
  './output/assets/mosquito-character-banner.webp',
  './output/assets/old_wang-character-banner.webp',
  './output/assets/slacker_yu-character-banner.webp',
  './output/assets/card-art-work.webp',
  './output/assets/card-art-meeting.webp',
  './output/assets/card-art-slack.webp',
  './output/assets/card-art-social.webp',
  './output/assets/card-art-phone.webp',
  './output/assets/card-art-think.webp',
  './output/assets/card-art-ai.webp',
  './output/assets/card-art-disrupt.webp',
  './output/assets/card-art-sunset.webp',
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

// Fetch: navigations are network-first so deployed UI updates are not trapped by an old cached shell.
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() =>
          caches.match(event.request)
            .then((cachedResponse) => cachedResponse || caches.match(new URL('./index.html', self.registration.scope).toString()))
        )
    );
    return;
  }

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
