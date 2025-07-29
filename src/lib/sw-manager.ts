import React from 'react';
// Enterprise Service Worker Management
// Client-side coordination with advanced caching

interface ServiceWorkerManager {
  register(): Promise<void>;
  preloadImages(urls: string[]): void;
  clearCache(): Promise<void>;
  getCacheStatus(): Promise<CacheStatus>;
}

interface CacheStatus {
  critical: number;
  products: number;
  thumbnails: number;
  totalSize: number;
}

class EnterpriseServiceWorkerManager implements ServiceWorkerManager {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private isSupported = false;

  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'caches' in window;
  }

  async register(): Promise<void> {
    if (!this.isSupported) {
      console.log('SW: Service Worker not supported');
      return;
    }

    try {
      // Unregister old service worker first
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
      
      // Register new service worker
      this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none' // Always check for updates
      });

      console.log('SW: Enterprise Service Worker registered:', this.swRegistration.scope);

      // Handle updates
      this.swRegistration.addEventListener('updatefound', () => {
        const newWorker = this.swRegistration?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('SW: New version available, reloading...');
              window.location.reload();
            }
          });
        }
      });

      // Listen for messages from SW
      navigator.serviceWorker.addEventListener('message', this.handleSWMessage);

      // Activate immediately if waiting
      if (this.swRegistration.waiting) {
        this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

    } catch (error) {
      console.error('SW: Registration failed:', error);
    }
  }

  private handleSWMessage = (event: MessageEvent) => {
    if (event.data?.type === 'SW_DISABLE') {
      console.log('SW: Received disable message, unregistering...');
      this.unregister();
    }
  };

  async unregister(): Promise<void> {
    if (this.swRegistration) {
      await this.swRegistration.unregister();
      this.swRegistration = null;
      console.log('SW: Service Worker unregistered');
    }
  }

  preloadImages(urls: string[]): void {
    if (!this.swRegistration?.active) return;

    // Filter unique URLs and limit to 10 to avoid overwhelming
    const uniqueUrls = [...new Set(urls)].slice(0, 10);
    
    this.swRegistration.active.postMessage({
      type: 'PRELOAD_IMAGES',
      urls: uniqueUrls
    });

    console.log('SW: Requested preload of', uniqueUrls.length, 'images');
  }

  async clearCache(): Promise<void> {
    if (!this.swRegistration?.active) return;

    this.swRegistration.active.postMessage({
      type: 'CLEAR_CACHE'
    });

    console.log('SW: Cache clear requested');
  }

  async getCacheStatus(): Promise<CacheStatus> {
    if (!this.isSupported) {
      return { critical: 0, products: 0, thumbnails: 0, totalSize: 0 };
    }

    try {
      const cacheNames = await caches.keys();
      let critical = 0, products = 0, thumbnails = 0, totalSize = 0;

      for (const cacheName of cacheNames) {
        if (!cacheName.startsWith('joyasjp-')) continue;

        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        const size = requests.length;

        if (cacheName.includes('critical')) {
          critical = size;
        } else if (cacheName.includes('products')) {
          products = size;
        } else if (cacheName.includes('thumbnails')) {
          thumbnails = size;
        }

        totalSize += size;
      }

      return { critical, products, thumbnails, totalSize };
    } catch (error) {
      console.error('SW: Failed to get cache status:', error as Error);
      return { critical: 0, products: 0, thumbnails: 0, totalSize: 0 };
    }
  }

  // Smart preloading based on user behavior
  preloadOnHover(imageUrl: string): void {
    // Debounce multiple hover calls
    clearTimeout((window as any)._hoverTimeout);
    (window as any)._hoverTimeout = setTimeout(() => {
      this.preloadImages([imageUrl]);
    }, 100);
  }

  // Preload related products when viewing a product
  preloadRelatedProducts(category: string, currentProductId: string): void {
    // This would integrate with your product API to get related images
    // For now, we'll just mark the intent
    console.log('SW: Preload related products requested for category:', category);
  }
}

// Singleton instance
export const swManager = new EnterpriseServiceWorkerManager();

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  // Register on page load
  window.addEventListener('load', () => {
    swManager.register();
  });

  // Development helpers
  if (process.env.NODE_ENV === 'development') {
    (window as any).swManager = swManager;
    (window as any).clearCache = () => swManager.clearCache();
    (window as any).getCacheStatus = () => swManager.getCacheStatus();
  }
}

// React Hook for Service Worker integration
export function useServiceWorker() {
  const [cacheStatus, setCacheStatus] = React.useState<CacheStatus>({
    critical: 0,
    products: 0,
    thumbnails: 0,
    totalSize: 0
  });

  React.useEffect(() => {
    const updateStatus = async () => {
      const status = await swManager.getCacheStatus();
      setCacheStatus(status);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, []);

  return {
    cacheStatus,
    preloadImages: swManager.preloadImages.bind(swManager),
    clearCache: swManager.clearCache.bind(swManager),
    preloadOnHover: swManager.preloadOnHover.bind(swManager)
  };
}

