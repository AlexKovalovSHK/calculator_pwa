// Версия кэша — увеличивай при каждом деплое
const CACHE_NAME = 'prognose-rechner-v1.1';

// Список файлов для кэширования
const urlsToCache = [
  '/',
  '/index.html?v=1.1',
  '/script.js?v=1.1',
  '/styles.css?v=1.1',
  '/manifest.json?v=1.1',
  '/icons/icon-192x192.png?v=1.1',
  '/icons/favicon-32x32.png?v=1.1'
];

// Установка SW и кэширование файлов
self.addEventListener('install', event => {
  self.skipWaiting(); // Активировать сразу без ожидания
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Активация — удаление старых кэшей
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim(); // Берём контроль над всеми клиентами сразу
});

// Перехват fetch-запросов — Stale-While-Revalidate
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // Обновляем кэш новыми данными
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          })
          .catch(() => cachedResponse); // Если нет сети — отдаем кэш

        // Возвращаем кэш сразу, а сеть обновляет его в фоне
        return cachedResponse || fetchPromise;
      });
    })
  );
});

// Опционально: получение сообщений от клиента для принудительного обновления
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
