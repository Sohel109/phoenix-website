// Service Worker minimaliste Phoenix EDC
// Stratégie : Network First pour les API, Cache First pour les assets statiques

const CACHE_VERSION = 'phoenix-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/logo-badge.jpg',
  '/logo-header.png',
  '/app-icon.png',
];

// Installation : précache des assets critiques
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {}); // silently fail si offline
    })
  );
  self.skipWaiting();
});

// Activation : nettoyage des anciens caches
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

// Fetch : Network First pour /api et /planning, Cache First pour le reste
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Toujours réseau pour les API Google Apps Script et notre backend
  if (url.pathname.startsWith('/api') || url.hostname.includes('script.google.com')) {
    event.respondWith(fetch(request).catch(() => new Response('', { status: 503 })));
    return;
  }

  // Cache First pour les assets statiques (fonts, images, JS/CSS)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        // Mettre en cache uniquement les réponses valides et les assets du même origin
        if (
          response.ok &&
          response.type === 'basic' &&
          (url.pathname.match(/\.(js|css|png|jpg|jpeg|webp|svg|woff2|ico)$/))
        ) {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => {
        // Fallback : renvoyer la page d'accueil (SPA routing)
        if (request.mode === 'navigate') {
          return caches.match('/') || new Response('Offline', { status: 503 });
        }
        return new Response('', { status: 503 });
      });
    })
  );
});
