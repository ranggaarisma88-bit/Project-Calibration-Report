const CACHE_NAME = 'koef-belt-scale-v9';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png', // Pastikan file ini ada di server
  './icon-512.png'  // Pastikan file ini ada di server
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((cache) => cache !== CACHE_NAME)
          .map((cache) => caches.delete(cache))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Abaikan request non-GET dan non-HTTP(S) (misal chrome-extension://)
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  // Stale-While-Revalidate:
  // Buka instan dari cache, sekaligus update cache di background jika ada internet
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
        const networkFetch = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || networkFetch;
      })
    )
  );
});