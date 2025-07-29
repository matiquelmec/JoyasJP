// Enterprise-level Service Worker for Advanced Image Caching
// Joyas JP - E-commerce Optimization

const CACHE_VERSION = 'v3';
const CRITICAL_IMAGES_CACHE = `joyasjp-critical-${CACHE_VERSION}`;
const PRODUCT_IMAGES_CACHE = `joyasjp-products-${CACHE_VERSION}`;
const THUMBNAILS_CACHE = `joyasjp-thumbnails-${CACHE_VERSION}`;

// Critical assets for immediate caching
const CRITICAL_ASSETS = [
  '/assets/logo.webp',
  '/assets/hero-poster.webp',
  '/assets/nosotros.webp'
];

// Cache duration configurations (enterprise-level)
const CACHE_CONFIG = {
  critical: 7 * 24 * 60 * 60 * 1000,      // 7 days
  products: 3 * 24 * 60 * 60 * 1000,      // 3 days  
  thumbnails: 24 * 60 * 60 * 1000         // 1 day
};

self.addEventListener('install', (event) => {
  console.log('SW: Installing enterprise-level caching...');
  
  event.waitUntil(
    Promise.all([
      // Pre-cache critical assets
      caches.open(CRITICAL_IMAGES_CACHE).then((cache) => {
        console.log('SW: Caching critical assets');
        return cache.addAll(CRITICAL_ASSETS).catch((error) => {
          console.warn('SW: Some critical assets failed to cache:', error);
        });
      }),
      // Skip waiting for immediate activation
      self.skipWaiting()
    ])
  );
});

self.addEventListener('activate', (event) => {
  console.log('SW: Activating enterprise caching system');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith('joyasjp-') && 
                !cacheName.includes(CACHE_VERSION)) {
              console.log('SW: Removing old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all pages
      self.clients.claim()
    ]).then(() => {
      console.log('SW: Enterprise caching system activated');
    })
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Only handle GET requests for images
  if (request.method !== 'GET' || !isImageRequest(request)) {
    return;
  }

  // Apply appropriate caching strategy
  const strategy = getCacheStrategy(url.pathname);
  
  if (strategy === 'critical') {
    event.respondWith(cacheFirstWithFallback(request, CRITICAL_IMAGES_CACHE));
  } else if (strategy === 'product') {
    event.respondWith(staleWhileRevalidate(request, PRODUCT_IMAGES_CACHE));
  } else if (strategy === 'thumbnail') {
    event.respondWith(cacheFirstWithExpiry(request, THUMBNAILS_CACHE, CACHE_CONFIG.thumbnails));
  }
});

// Helper Functions

function isImageRequest(request) {
  const url = new URL(request.url);
  return request.destination === 'image' || 
         /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(url.pathname) ||
         url.pathname.includes('/assets/');
}

function getCacheStrategy(pathname) {
  if (CRITICAL_ASSETS.some(asset => pathname.includes(asset.replace('/assets/', '')))) {
    return 'critical';
  }
  if (pathname.includes('/assets/Products/')) {
    return 'product';
  }
  // Default for small images and thumbnails
  return 'thumbnail';
}

// Cache First with Fallback (for critical images)
async function cacheFirstWithFallback(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse && !isExpired(cachedResponse, CACHE_CONFIG.critical)) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const responseToCache = addTimestamp(networkResponse.clone());
      cache.put(request, responseToCache);
    }
    return networkResponse;
    
  } catch (error) {
    console.warn('SW: Network failed, trying fallback:', error);
    return getFallbackResponse(request);
  }
}

// Stale While Revalidate (for product images)
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Background fetch to update cache
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const responseToCache = addTimestamp(networkResponse.clone());
      cache.put(request, responseToCache);
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  // Return cached immediately if available and not expired
  if (cachedResponse && !isExpired(cachedResponse, CACHE_CONFIG.products)) {
    return cachedResponse;
  }
  
  // Wait for network if no cache or expired
  return fetchPromise;
}

// Cache First with Expiry (for thumbnails)
async function cacheFirstWithExpiry(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse && !isExpired(cachedResponse, maxAge)) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const responseToCache = addTimestamp(networkResponse.clone());
      cache.put(request, responseToCache);
    }
    return networkResponse;
  } catch (error) {
    // Return stale cache if network fails
    return cachedResponse || getFallbackResponse(request);
  }
}

// Cache management utilities
function addTimestamp(response) {
  const newHeaders = new Headers(response.headers);
  newHeaders.set('sw-cached-at', Date.now().toString());
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}

function isExpired(response, maxAge) {
  const cachedAt = response.headers.get('sw-cached-at');
  if (!cachedAt) return true;
  
  return (Date.now() - parseInt(cachedAt)) > maxAge;
}

async function getFallbackResponse(request) {
  console.log('SW: Image failed to load:', request.url);
  
  // DON'T return logo for product images - let them fail naturally
  // Only return fallback for critical assets
  const url = new URL(request.url);
  if (url.pathname.includes('/assets/Products/') || url.pathname.includes('supabase')) {
    console.log('SW: Product image failed, returning network error instead of fallback');
    return new Response('', { status: 404, statusText: 'Image not found' });
  }
  
  // Only for critical images (logo, hero), return transparent pixel
  return new Response(
    new Uint8Array([71,73,70,56,57,97,1,0,1,0,128,0,0,255,255,255,0,0,0,33,249,4,1,0,0,0,0,44,0,0,0,0,1,0,1,0,0,2,2,68,1,0,59]),
    { 
      status: 200, 
      statusText: 'OK', 
      headers: { 'Content-Type': 'image/gif' } 
    }
  );
}

// Performance optimization: Preload images on hover
self.addEventListener('message', (event) => {
  if (event.data?.type === 'PRELOAD_IMAGES') {
    preloadImages(event.data.urls);
  }
  
  if (event.data?.type === 'CLEAR_CACHE') {
    clearAllCaches();
  }
});

async function preloadImages(urls) {
  console.log('SW: Preloading images:', urls.length);
  const cache = await caches.open(PRODUCT_IMAGES_CACHE);
  
  const preloadPromises = urls.map(async (url) => {
    try {
      if (await cache.match(url)) {
        return; // Already cached
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const timestampedResponse = addTimestamp(response);
        await cache.put(url, timestampedResponse);
      }
    } catch (error) {
      console.warn('SW: Failed to preload:', url, error);
    }
  });
  
  await Promise.allSettled(preloadPromises);
  console.log('SW: Preloading completed');
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  console.log('SW: All caches cleared');
}

// Cache size management
async function manageCacheSize() {
  const cache = await caches.open(PRODUCT_IMAGES_CACHE);
  const requests = await cache.keys();
  
  // If more than 200 cached images, remove oldest 50
  if (requests.length > 200) {
    const sorted = requests.sort((a, b) => {
      const aTime = parseInt(a.headers.get('sw-cached-at') || '0');
      const bTime = parseInt(b.headers.get('sw-cached-at') || '0');
      return aTime - bTime;
    });
    
    const toDelete = sorted.slice(0, 50);
    await Promise.all(toDelete.map(req => cache.delete(req)));
    
    console.log('SW: Cache size managed, removed', toDelete.length, 'old entries');
  }
}

// Run cache management every hour
setInterval(manageCacheSize, 60 * 60 * 1000);