"use client";

import { useEffect, useState, useMemo } from 'react';
import { Product } from '@/lib/types';
import ProductCard from './product-card';
import { ProductVirtualGrid } from '@/components/performance/virtual-scroll';
import { useProductInfiniteScroll, InfiniteScrollSentinel } from '@/hooks/use-infinite-scroll';
import { ProductGridSkeleton } from '@/components/ui/advanced-skeleton';
import { useVirtualScrollOptimization, useComponentOptimization } from '@/hooks/use-device-optimization';
// Performance monitor import removed - not used in current implementation
import { cn } from '@/lib/utils';

interface OptimizedProductGridProps {
  initialProducts?: Product[];
  searchQuery?: string;
  category?: string;
  sortBy?: string;
  className?: string;
  enableVirtualScrolling?: boolean;
  enableInfiniteScroll?: boolean;
}

// Función para obtener productos reales desde la API
async function fetchProducts(
  page: number,
  searchQuery = '',
  category = '',
  sortBy = ''
): Promise<{ data: Product[]; hasMore: boolean; total: number }> {
  
  try {
    // Importar getProducts desde la API real
    const { getProducts } = await import('@/lib/api');
    
    // Obtener productos reales
    const allProducts = await getProducts();
    
    // Aplicar filtros
    let filteredProducts = allProducts;
    
    if (searchQuery) {
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    
    // Aplicar paginación
    const pageSize = 12;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    return {
      data: paginatedProducts,
      hasMore: endIndex < filteredProducts.length,
      total: filteredProducts.length
    };
    
  } catch (error) {
    console.error('Error fetching products:', error);
    // Fallback en caso de error - retornar array vacío
    return {
      data: [],
      hasMore: false,
      total: 0
    };
  }
}

export function OptimizedProductGrid({
  initialProducts = [],
  searchQuery = '',
  category = '',
  sortBy = '',
  className,
  enableVirtualScrolling = true,
  enableInfiniteScroll = true,
}: OptimizedProductGridProps) {
  
  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts);
  const scrollConfig = useVirtualScrollOptimization();
  const componentConfig = useComponentOptimization();

  // Performance monitoring removed for bundle optimization

  // Función para cargar más productos
  const loadMoreProducts = async (page: number) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 Loading page ${page} with query: "${searchQuery}", category: "${category}"`);
    }
    return await fetchProducts(page, searchQuery, category, sortBy);
  };

  // Hook de infinite scroll
  const {
    items: infiniteProducts,
    isLoading,
    hasNextPage,
    error,
    reset,
    containerRef,
    sentinelRef,
  } = useProductInfiniteScroll(loadMoreProducts, {
    enabled: enableInfiniteScroll,
    threshold: 0.2,
    rootMargin: '300px',
  });

  // Combinar productos iniciales con los del infinite scroll
  const displayProducts = useMemo(() => {
    if (enableInfiniteScroll) {
      return infiniteProducts.length > 0 ? infiniteProducts : allProducts;
    }
    return allProducts;
  }, [enableInfiniteScroll, infiniteProducts, allProducts]);

  // Reset cuando cambian los filtros
  useEffect(() => {
    if (enableInfiniteScroll) {
      reset();
    }
  }, [searchQuery, category, sortBy, reset, enableInfiniteScroll]);

  // Función para renderizar una tarjeta de producto
  const renderProductCard = (product: Product, index: number) => (
    <ProductCard
      key={product.id}
      product={product}
      index={index}
      priority={index < 6}
      className="animate-fadeIn"
    />
  );

  // Mostrar skeleton mientras carga
  if (displayProducts.length === 0 && isLoading) {
    return (
      <div className={cn("container mx-auto px-4", className)}>
        <ProductGridSkeleton count={scrollConfig.columns * 3} />
      </div>
    );
  }

  // Mostrar mensaje si no hay productos
  if (displayProducts.length === 0 && !isLoading) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-1 1m0 0l-1 1m1-1v4M6 5l1 1v4" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">No se encontraron productos</h3>
        <p className="text-muted-foreground max-w-md">
          No hay productos que coincidan con tus criterios de búsqueda. 
          Intenta ajustar los filtros o busca algo diferente.
        </p>
      </div>
    );
  }

  // Decidir si usar virtual scrolling basado en la cantidad de productos y configuración
  const shouldUseVirtualScrolling = 
    enableVirtualScrolling && 
    displayProducts.length > componentConfig.virtualScrollThreshold;

  if (shouldUseVirtualScrolling) {
    return (
      <div className={cn("w-full", className)}>
        <ProductVirtualGrid
          products={displayProducts}
          renderProduct={renderProductCard}
          className="min-h-[80vh]"
          onLoadMore={enableInfiniteScroll && hasNextPage ? () => {} : undefined}
          loading={isLoading}
        />
        
        {/* Sentinel para infinite scroll con virtual grid */}
        {enableInfiniteScroll && (
          <div ref={sentinelRef}>
            <InfiniteScrollSentinel
              isLoading={isLoading}
              hasNextPage={hasNextPage}
              error={error}
            />
          </div>
        )}
      </div>
    );
  }

  // Grid normal sin virtualización
  return (
    <div 
      ref={containerRef}
      className={cn("w-full", className)}
    >
      <div className={cn(
        "grid gap-6",
        `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${scrollConfig.columns}`,
        "auto-rows-fr"
      )}>
        {displayProducts.map((product, index) => renderProductCard(product, index))}
      </div>

      {/* Sentinel para infinite scroll */}
      {enableInfiniteScroll && (
        <div ref={sentinelRef}>
          <InfiniteScrollSentinel
            isLoading={isLoading}
            hasNextPage={hasNextPage}
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      )}

      {/* Información de productos cargados */}
      {displayProducts.length > 0 && (
        <div className="text-center mt-8 text-sm text-muted-foreground">
          Mostrando {displayProducts.length} productos
          {hasNextPage && !isLoading && (
            <span> · Desplázate para cargar más</span>
          )}
        </div>
      )}
    </div>
  );
}

// Componente wrapper con configuración por defecto
export default function ProductGrid(props: OptimizedProductGridProps) {
  return (
    <OptimizedProductGrid
      {...props}
      enableVirtualScrolling={props.enableVirtualScrolling ?? true}
      enableInfiniteScroll={props.enableInfiniteScroll ?? true}
    />
  );
}

// Hook para estadísticas de rendimiento
export function useProductGridPerformance() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    visibleProducts: 0,
    loadTime: 0,
    memoryUsage: 0,
  });

  useEffect(() => {
    const updateStats = () => {
      const products = document.querySelectorAll('[data-product-card]');
      const visibleProducts = Array.from(products).filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
      });

      setStats({
        totalProducts: products.length,
        visibleProducts: visibleProducts.length,
        loadTime: performance.now(),
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      });
    };

    const interval = setInterval(updateStats, 2000);
    updateStats();

    return () => clearInterval(interval);
  }, []);

  return stats;
}