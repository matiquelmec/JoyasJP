// Service Worker deshabilitado temporalmente para eliminar cache legacy
const CACHE_NAME = 'joyas-jp-disabled';
const STATIC_CACHE = 'joyas-jp-disabled';
const DYNAMIC_CACHE = 'joyas-jp-disabled';

// Recursos estáticos críticos para cachear
const STATIC_ASSETS = [
  '/',
  '/productos',
  '/manifest.json',
  '/assets/logo.webp',
];

// URLs de APIs que deben cachearse
const API_CACHE_PATTERNS = [
  /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\//,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Limpiando todos los caches antiguos');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        // Borrar TODOS los caches para eliminar datos legacy
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('Service Worker: Eliminando cache', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Todos los caches eliminados');
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Service Worker deshabilitado - no interceptar requests
  // Dejar que todas las requests pasen directamente a la red
  console.log('Service Worker: Request pasando sin intercepción:', event.request.url);
});