// Service Worker completamente deshabilitado
// Este archivo fuerza la eliminación de cualquier Service Worker anterior

self.addEventListener('install', (event) => {
  // Saltarse la espera para activar inmediatamente
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('SW: Eliminando TODOS los caches y deshabilitando SW');
  
  event.waitUntil(
    Promise.all([
      // Eliminar todos los caches existentes
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('SW: Eliminando cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }),
      // Tomar control inmediato de todos los clientes
      self.clients.claim()
    ]).then(() => {
      console.log('SW: Cache eliminado, SW será desregistrado');
      // Notificar a todos los clientes que se desregistren el SW
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SW_DISABLE' });
        });
      });
    })
  );
});

// No interceptar ningún fetch - dejar todo pasar
self.addEventListener('fetch', (event) => {
  // No hacer nada - dejar que todas las requests pasen normalmente
});