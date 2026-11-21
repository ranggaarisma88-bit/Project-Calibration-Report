const CACHE_NAME = 'koef-belt-scale-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Install Service Worker & Simpan File ke Cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Menyimpan file ke cache...');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Aktivasi & Hapus Cache Lama jika ada update
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Menghapus cache lama:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Ambil dari Cache jika Offline, jika ada internet ambil dari Network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});