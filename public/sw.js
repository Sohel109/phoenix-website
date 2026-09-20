// Service Worker Phoenix EDC
// Stratégie : Network First pour navigation (HTML) et API, Stale-While-Revalidate / Cache First pour assets avec hash

const CACHE_VERSION = 'phoenix-v2';
const STATIC_ASSETS = [
  '/manifest.webmanifest',
  '/logo-badge.jpg',
  '/logo-header.png',
  '/app-icon.png',
];

// Installation : précache des assets critiques statiques
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activation : nettoyage immédiat de tous les anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch : Network First pour navigation (HTML) et API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Toujours réseau pour les API Google Apps Script et notre backend
  if (url.pathname.startsWith('/api') || url.hostname.includes('script.google.com')) {
    event.respondWith(fetch(request).catch(() => new Response('', { status: 503 })));
    return;
  }

  // 2. Network First absolu pour la navigation HTML (permet de toujours recevoir la dernière version déployée)
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match('/') || new Response('Hors ligne', { status: 503 });
        })
    );
    return;
  }

  // 3. Cache First / Fallback réseau pour les assets statiques avec hash
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (
          response.ok &&
          response.type === 'basic' &&
          (url.pathname.match(/\.(js|css|png|jpg|jpeg|webp|svg|woff2|ico)$/))
        ) {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => new Response('', { status: 503 }));
    })
  );
});
