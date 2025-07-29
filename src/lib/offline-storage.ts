// Enterprise IndexedDB Storage for Offline E-commerce
// Product favorites, cart persistence, and offline capabilities
import React from 'react';

interface OfflineProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  description?: string;
  materials?: string;
  color?: string;
  cachedAt: number;
}

interface OfflineStorage {
  // Favorites management
  addFavorite(product: OfflineProduct): Promise<void>;
  removeFavorite(productId: string): Promise<void>;
  getFavorites(): Promise<OfflineProduct[]>;
  isFavorite(productId: string): Promise<boolean>;
  
  // Cart persistence
  saveCart(items: any[]): Promise<void>;
  getCart(): Promise<any[]>;
  clearCart(): Promise<void>;
  
  // Product caching
  cacheProduct(product: OfflineProduct): Promise<void>;
  getCachedProduct(productId: string): Promise<OfflineProduct | null>;
  getCachedProducts(category?: string): Promise<OfflineProduct[]>;
  
  // Storage management
  clearExpiredCache(): Promise<void>;
  getStorageStats(): Promise<StorageStats>;
}

interface StorageStats {
  favorites: number;
  cachedProducts: number;
  cartItems: number;
  totalSize: number;
}

class EnterpriseOfflineStorage implements OfflineStorage {
  private db: IDBDatabase | null = null;
  private dbName = 'JoyasJP_Enterprise';
  private dbVersion = 1;
  
  // Cache expiry: 24 hours for products, never for favorites
  private readonly PRODUCT_CACHE_EXPIRY = 24 * 60 * 60 * 1000;

  constructor() {
    this.initDB();
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        console.warn('IndexedDB not supported');
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB: Enterprise storage initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Favorites store
        if (!db.objectStoreNames.contains('favorites')) {
          const favoritesStore = db.createObjectStore('favorites', { keyPath: 'id' });
          favoritesStore.createIndex('category', 'category', { unique: false });
          favoritesStore.createIndex('cachedAt', 'cachedAt', { unique: false });
        }

        // Cart store
        if (!db.objectStoreNames.contains('cart')) {
          db.createObjectStore('cart', { keyPath: 'id' });
        }

        // Product cache store
        if (!db.objectStoreNames.contains('productCache')) {
          const cacheStore = db.createObjectStore('productCache', { keyPath: 'id' });
          cacheStore.createIndex('category', 'category', { unique: false });
          cacheStore.createIndex('cachedAt', 'cachedAt', { unique: false });
        }

        // Settings store for user preferences
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        console.log('IndexedDB: Database schema created');
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initDB();
    }
    return this.db!;
  }

  // Favorites Management
  async addFavorite(product: OfflineProduct): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['favorites'], 'readwrite');
    const store = transaction.objectStore('favorites');
    
    const favoriteProduct = {
      ...product,
      cachedAt: Date.now()
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.put(favoriteProduct);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    console.log('IndexedDB: Added favorite:', product.name);
  }

  async removeFavorite(productId: string): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['favorites'], 'readwrite');
    const store = transaction.objectStore('favorites');

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(productId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    console.log('IndexedDB: Removed favorite:', productId);
  }

  async getFavorites(): Promise<OfflineProduct[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['favorites'], 'readonly');
    const store = transaction.objectStore('favorites');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async isFavorite(productId: string): Promise<boolean> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['favorites'], 'readonly');
    const store = transaction.objectStore('favorites');

    return new Promise((resolve, reject) => {
      const request = store.get(productId);
      request.onsuccess = () => resolve(!!request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Cart Persistence
  async saveCart(items: any[]): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['cart'], 'readwrite');
    const store = transaction.objectStore('cart');

    // Clear existing cart
    await new Promise<void>((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    });

    // Add new items
    for (const item of items) {
      await new Promise<void>((resolve, reject) => {
        const request = store.add({
          ...item,
          cachedAt: Date.now()
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }

    console.log('IndexedDB: Cart saved with', items.length, 'items');
  }

  async getCart(): Promise<any[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['cart'], 'readonly');
    const store = transaction.objectStore('cart');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async clearCart(): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['cart'], 'readwrite');
    const store = transaction.objectStore('cart');

    await new Promise<void>((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    console.log('IndexedDB: Cart cleared');
  }

  // Product Caching
  async cacheProduct(product: OfflineProduct): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['productCache'], 'readwrite');
    const store = transaction.objectStore('productCache');

    const cachedProduct = {
      ...product,
      cachedAt: Date.now()
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.put(cachedProduct);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCachedProduct(productId: string): Promise<OfflineProduct | null> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['productCache'], 'readonly');
    const store = transaction.objectStore('productCache');

    return new Promise((resolve, reject) => {
      const request = store.get(productId);
      request.onsuccess = () => {
        const result = request.result;
        if (result && !this.isExpired(result.cachedAt)) {
          resolve(result);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getCachedProducts(category?: string): Promise<OfflineProduct[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['productCache'], 'readonly');
    const store = transaction.objectStore('productCache');

    return new Promise((resolve, reject) => {
      let request: IDBRequest;
      
      if (category) {
        const index = store.index('category');
        request = index.getAll(category);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => {
        const results = request.result || [];
        // Filter out expired products
        const validProducts = results.filter(
          (product: OfflineProduct) => !this.isExpired(product.cachedAt)
        );
        resolve(validProducts);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Storage Management
  async clearExpiredCache(): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['productCache'], 'readwrite');
    const store = transaction.objectStore('productCache');
    const index = store.index('cachedAt');

    const expiredTime = Date.now() - this.PRODUCT_CACHE_EXPIRY;
    const range = IDBKeyRange.upperBound(expiredTime);

    await new Promise<void>((resolve, reject) => {
      const request = index.openCursor(range);
      let deletedCount = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          console.log('IndexedDB: Cleared', deletedCount, 'expired products');
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getStorageStats(): Promise<StorageStats> {
    const db = await this.ensureDB();
    
    const [favorites, cachedProducts, cartItems] = await Promise.all([
      this.getFavorites(),
      this.getCachedProducts(),
      this.getCart()
    ]);

    return {
      favorites: favorites.length,
      cachedProducts: cachedProducts.length,
      cartItems: cartItems.length,
      totalSize: favorites.length + cachedProducts.length + cartItems.length
    };
  }

  private isExpired(cachedAt: number): boolean {
    return (Date.now() - cachedAt) > this.PRODUCT_CACHE_EXPIRY;
  }
}

// Singleton instance
export const offlineStorage = new EnterpriseOfflineStorage();

// React Hook for offline storage
export function useOfflineStorage() {
  const [stats, setStats] = React.useState<StorageStats>({
    favorites: 0,
    cachedProducts: 0,
    cartItems: 0,
    totalSize: 0
  });

  React.useEffect(() => {
    const updateStats = async () => {
      try {
        const newStats = await offlineStorage.getStorageStats();
        setStats(newStats);
      } catch (error) {
        console.error('Failed to get storage stats:', error);
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    addFavorite: offlineStorage.addFavorite.bind(offlineStorage),
    removeFavorite: offlineStorage.removeFavorite.bind(offlineStorage),
    getFavorites: offlineStorage.getFavorites.bind(offlineStorage),
    isFavorite: offlineStorage.isFavorite.bind(offlineStorage),
    saveCart: offlineStorage.saveCart.bind(offlineStorage),
    getCart: offlineStorage.getCart.bind(offlineStorage),
    clearExpiredCache: offlineStorage.clearExpiredCache.bind(offlineStorage)
  };
}

// Auto-cleanup on app start
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    // Clean expired cache after 5 seconds
    setTimeout(() => {
      offlineStorage.clearExpiredCache();
    }, 5000);
  });
}

