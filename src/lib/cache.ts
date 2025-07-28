// Cache en memoria para optimizar consultas frecuentes
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // time to live en milliseconds
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void { // 5 minutos por defecto
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    const now = Date.now();
    const isExpired = (now - item.timestamp) > item.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    const now = Date.now();
    const isExpired = (now - item.timestamp) > item.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Limpia automáticamente items expirados
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if ((now - item.timestamp) > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Estadísticas del cache
  stats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Instancia global del cache
export const memoryCache = new MemoryCache();

// Función helper para cachear resultados de funciones async
export async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Intenta obtener del cache primero
  const cached = memoryCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Si no está en cache, ejecuta la función y cachea el resultado
  try {
    const result = await fetchFn();
    memoryCache.set(key, result, ttl);
    return result;
  } catch (error) {
    // En caso de error, no cacheamos
    throw error;
  }
}

// Limpia automáticamente el cache cada 10 minutos
if (typeof window !== 'undefined') {
  setInterval(() => {
    memoryCache.cleanup();
  }, 10 * 60 * 1000);
}