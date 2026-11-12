// Self-destruct & Cleanup Service Worker: desregistra y vacía cachés obsoletas de inmediato
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    }).then(() => {
      return self.clients.claim();
    }).then(() => {
      return self.registration.unregister();
    })
  );
});

// Peticiones directas a la red sin interceptar ni cachear nada
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
