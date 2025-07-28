// Service Worker optimizado para JoyasJP
const CACHE_NAME = 'joyas-jp-v1';
const STATIC_CACHE = 'joyas-jp-static-v1';
const DYNAMIC_CACHE = 'joyas-jp-dynamic-v1';

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
  /^\/api\/products/,
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
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache strategy para imágenes de productos
  if (request.destination === 'image' || 
      API_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE)
        .then((cache) => {
          return cache.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                // Devolver desde cache y actualizar en background
                fetch(request).then((fetchResponse) => {
                  if (fetchResponse && fetchResponse.status === 200) {
                    cache.put(request, fetchResponse.clone());
                  }
                }).catch(() => {}); // Silent fail
                return cachedResponse;
              }

              // Si no está en cache, hacer fetch y cachear
              return fetch(request)
                .then((fetchResponse) => {
                  if (!fetchResponse || fetchResponse.status !== 200) {
                    return fetchResponse;
                  }
                  cache.put(request, fetchResponse.clone());
                  return fetchResponse;
                })
                .catch(() => {
                  // Fallback para imágenes
                  if (request.destination === 'image') {
                    return new Response(
                      '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Imagen no disponible</text></svg>',
                      { headers: { 'Content-Type': 'image/svg+xml' } }
                    );
                  }
                });
            });
        })
    );
    return;
  }

  // Cache strategy para páginas
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.open(STATIC_CACHE)
        .then((cache) => {
          return cache.match(request)
            .then((cachedResponse) => {
              return fetch(request)
                .then((fetchResponse) => {
                  if (fetchResponse && fetchResponse.status === 200) {
                    cache.put(request, fetchResponse.clone());
                  }
                  return fetchResponse;
                })
                .catch(() => {
                  return cachedResponse || new Response('Página no disponible offline', {
                    status: 503,
                    headers: { 'Content-Type': 'text/html' }
                  });
                });
            });
        })
    );
    return;
  }

  // Para todo lo demás, red primero
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});