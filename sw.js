// Генерируем версию на основе текущей даты и времени
const CACHE_VERSION = new Date().toISOString().replace(/[-:.]/g, "");
const CACHE_NAME = `prognose_rechner-v${CACHE_VERSION}`;

const urlsToCache = [
  `/index.html?v=${CACHE_VERSION}`,
  `/script.js?v=${CACHE_VERSION}`,
  `/styles.css?v=${CACHE_VERSION}`,
  `/manifest.json?v=${CACHE_VERSION}`,
  `/icons/icon-192x192.png?v=${CACHE_VERSION}`
];

// Установка SW и кэширование
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Активация — удаление старых кэшей
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch с "Stale While Revalidate"
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        }).catch(() => cachedResponse);
        return cachedResponse || fetchPromise;
      });
    })
  );
});
