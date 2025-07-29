"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDeviceOptimization } from './use-device-optimization';

interface InfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  hasNextPage?: boolean;
  isLoading?: boolean;
  enabled?: boolean;
  delay?: number;
  initialPageSize?: number;
  maxConcurrentRequests?: number;
}

interface InfiniteScrollReturn<T> {
  items: T[];
  isLoading: boolean;
  hasNextPage: boolean;
  error: string | null;
  loadMore: () => void;
  reset: () => void;
  setItems: (items: T[]) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  sentinelRef: React.RefObject<HTMLDivElement>;
}

export function useInfiniteScroll<T>(
  fetchMore: (page: number) => Promise<{ data: T[]; hasMore: boolean; total?: number }>,
  options: InfiniteScrollOptions = {}
): InfiniteScrollReturn<T> {
  const {
    threshold = 0.1,
    rootMargin = '100px',
    hasNextPage: externalHasNextPage,
    isLoading: externalIsLoading,
    enabled = true,
    delay = 0,
    initialPageSize = 20,
    maxConcurrentRequests = 2,
  } = options;

  const { connection, performance } = useDeviceOptimization();
  
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRequests, setActiveRequests] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Configuración inteligente basada en dispositivo y conexión
  const getOptimizedConfig = useCallback(() => {
    const isSlowConnection = ['slow-2g', '2g', '3g'].includes(connection.type);
    const isLowPerformance = performance.level === 'low';
    
    return {
      rootMargin: isSlowConnection ? '50px' : rootMargin,
      threshold: isSlowConnection ? 0.5 : threshold,
      delay: isSlowConnection ? Math.max(delay, 500) : delay,
      maxRequests: isSlowConnection ? 1 : Math.min(maxConcurrentRequests, 3),
    };
  }, [connection.type, performance.level, rootMargin, threshold, delay, maxConcurrentRequests]);

  // Función para cargar más elementos
  const loadMore = useCallback(async () => {
    if (isLoading || !hasNextPage || !enabled) return;
    if (externalIsLoading || (externalHasNextPage !== undefined && !externalHasNextPage)) return;
    
    const config = getOptimizedConfig();
    if (activeRequests >= config.maxRequests) return;

    setIsLoading(true);
    setError(null);
    setActiveRequests(prev => prev + 1);

    try {
      const delayPromise = config.delay > 0 ? 
        new Promise(resolve => setTimeout(resolve, config.delay)) : 
        Promise.resolve();

      await delayPromise;

      const result = await fetchMore(page);
      
      setItems(prevItems => [...prevItems, ...result.data]);
      setHasNextPage(result.hasMore);
      setPage(prevPage => prevPage + 1);
      
      // Logging para debugging
      console.log(`📄 Loaded page ${page}, ${result.data.length} items, hasMore: ${result.hasMore}`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading more items';
      setError(errorMessage);
      console.error('Infinite scroll error:', err);
    } finally {
      setIsLoading(false);
      setActiveRequests(prev => prev - 1);
    }
  }, [
    isLoading, 
    hasNextPage, 
    enabled, 
    externalIsLoading, 
    externalHasNextPage,
    page, 
    fetchMore, 
    getOptimizedConfig,
    activeRequests
  ]);

  // Configurar Intersection Observer
  useEffect(() => {
    if (!enabled || !sentinelRef.current) return;

    const config = getOptimizedConfig();
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        
        if (entry.isIntersecting) {
          // Debounce para evitar múltiples requests
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          timeoutRef.current = setTimeout(() => {
            loadMore();
          }, 100);
        }
      },
      {
        threshold: config.threshold,
        rootMargin: config.rootMargin,
        root: containerRef.current,
      }
    );

    observer.observe(sentinelRef.current);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, loadMore, getOptimizedConfig]);

  // Reset function
  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasNextPage(true);
    setError(null);
    setIsLoading(false);
    setActiveRequests(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    items,
    isLoading: isLoading || (externalIsLoading ?? false),
    hasNextPage: hasNextPage && (externalHasNextPage ?? true),
    error,
    loadMore,
    reset,
    setItems,
    containerRef,
    sentinelRef,
  };
}

// Hook especializado para productos
export function useProductInfiniteScroll(
  fetchProducts: (page: number) => Promise<{ data: any[]; hasMore: boolean; total?: number }>,
  options: InfiniteScrollOptions = {}
) {
  return useInfiniteScroll(fetchProducts, {
    initialPageSize: 12,
    threshold: 0.2,
    rootMargin: '200px',
    delay: 100,
    ...options,
  });
}

// Hook para scroll infinito con búsqueda
export function useSearchInfiniteScroll<T>(
  searchFn: (query: string, page: number) => Promise<{ data: T[]; hasMore: boolean; total?: number }>,
  query: string,
  options: InfiniteScrollOptions = {}
) {
  const [searchQuery, setSearchQuery] = useState(query);
  
  const fetchMore = useCallback(
    (page: number) => searchFn(searchQuery, page),
    [searchFn, searchQuery]
  );

  const infiniteScroll = useInfiniteScroll(fetchMore, options);

  // Reset cuando cambia la búsqueda
  useEffect(() => {
    if (query !== searchQuery) {
      setSearchQuery(query);
      infiniteScroll.reset();
    }
  }, [query, searchQuery, infiniteScroll]);

  return {
    ...infiniteScroll,
    searchQuery,
  };
}

// Hook para scroll infinito con filtros
export function useFilteredInfiniteScroll<T>(
  fetchFn: (filters: Record<string, any>, page: number) => Promise<{ data: T[]; hasMore: boolean; total?: number }>,
  filters: Record<string, any>,
  options: InfiniteScrollOptions = {}
) {
  const [currentFilters, setCurrentFilters] = useState(filters);
  
  const fetchMore = useCallback(
    (page: number) => fetchFn(currentFilters, page),
    [fetchFn, currentFilters]
  );

  const infiniteScroll = useInfiniteScroll(fetchMore, options);

  // Reset cuando cambian los filtros
  useEffect(() => {
    const filtersChanged = JSON.stringify(filters) !== JSON.stringify(currentFilters);
    if (filtersChanged) {
      setCurrentFilters(filters);
      infiniteScroll.reset();
    }
  }, [filters, currentFilters, infiniteScroll]);

  return {
    ...infiniteScroll,
    currentFilters,
  };
}

// Componente de sentinel para scroll infinito
interface InfiniteScrollSentinelProps {
  isLoading: boolean;
  hasNextPage: boolean;
  error: string | null;
  onRetry?: () => void;
  loadingComponent?: React.ReactNode;
  endComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
}

export function InfiniteScrollSentinel({
  isLoading,
  hasNextPage,
  error,
  onRetry,
  loadingComponent,
  endComponent,
  errorComponent,
}: InfiniteScrollSentinelProps) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        {errorComponent || (
          <>
            <p className="text-red-500 mb-4">Error al cargar más elementos</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Reintentar
              </button>
            )}
          </>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        {loadingComponent || (
          <>
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-muted-foreground">Cargando más productos...</span>
          </>
        )}
      </div>
    );
  }

  if (!hasNextPage) {
    return (
      <div className="flex justify-center items-center py-8 text-center">
        {endComponent || (
          <div className="text-muted-foreground">
            <p>🎉 ¡Has visto todos los productos!</p>
            <p className="text-sm mt-1">No hay más elementos para mostrar</p>
          </div>
        )}
      </div>
    );
  }

  return null;
}

// Hook para manejar scroll to top
export function useScrollToTop() {
  const scrollToTop = useCallback((smooth: boolean = true) => {
    window.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'instant',
    });
  }, []);

  const scrollToElement = useCallback((elementId: string, smooth: boolean = true) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: smooth ? 'smooth' : 'instant',
        block: 'start',
      });
    }
  }, []);

  return {
    scrollToTop,
    scrollToElement,
  };
}