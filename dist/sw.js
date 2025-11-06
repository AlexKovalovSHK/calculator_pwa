const CACHE_NAME = 'prognose-rechner-v1.0';
// Файлы, которые должны быть закэшированы
const urlsToCache = [
  '/',
  '/index.html',
  '/script.js',
  '/styles.css', // Если у вас есть CSS
  '/manifest.json',
  '/icons/icon-192x192.png'
];

// Установка Service Worker и кэширование статических файлов
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Перехват запросов для обслуживания из кэша
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Если файл найден в кэше, отдаем его
        if (response) {
          return response;
        }
        // Иначе - делаем запрос в сеть
        return fetch(event.request);
      })
  );
});

// Активация: удаление старых кэшей
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});