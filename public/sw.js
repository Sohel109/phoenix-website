// Service Worker Auto-Purge Phoenix EDC
// Désactive et nettoie immédiatement tout cache obsolète pour tous les visiteurs

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((clients) => {
        // Recharge automatiquement les onglets existants sur la version fraîche du serveur
        clients.forEach((client) => {
          if (client.url && 'navigate' in client) {
            client.navigate(client.url);
          }
        });
      })
  );
});

// Pour toute requête résiduelle pendant la transition, toujours forcer le réseau direct
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});

