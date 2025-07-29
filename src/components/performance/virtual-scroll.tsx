"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface VirtualScrollProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  gap?: number;
}

export function VirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className,
  onScroll,
  gap = 0,
}: VirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * (itemHeight + gap);

  const startIndex = useMemo(() => {
    return Math.floor(scrollTop / (itemHeight + gap));
  }, [scrollTop, itemHeight, gap]);

  const endIndex = useMemo(() => {
    return Math.min(
      startIndex + Math.ceil(containerHeight / (itemHeight + gap)) + overscan,
      items.length - 1
    );
  }, [startIndex, containerHeight, itemHeight, gap, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(
      Math.max(0, startIndex - overscan),
      endIndex + 1
    );
  }, [items, startIndex, endIndex, overscan]);

  const offsetY = useMemo(() => {
    return Math.max(0, startIndex - overscan) * (itemHeight + gap);
  }, [startIndex, overscan, itemHeight, gap]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setScrollTop(scrollTop);
    onScroll?.(scrollTop);
  }, [onScroll]);

  return (
    <div
      ref={scrollElementRef}
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = Math.max(0, startIndex - overscan) + index;
            return (
              <div
                key={actualIndex}
                style={{
                  height: itemHeight,
                  marginBottom: gap,
                }}
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Virtual Grid para productos
interface VirtualGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  gap?: number;
  overscan?: number;
  className?: string;
}

export function VirtualGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  renderItem,
  gap = 16,
  overscan = 5,
  className,
}: VirtualGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calcular cuántos elementos caben por fila
  const itemsPerRow = Math.floor((containerWidth + gap) / (itemWidth + gap));
  const totalRows = Math.ceil(items.length / itemsPerRow);
  const rowHeight = itemHeight + gap;

  const startRow = useMemo(() => {
    return Math.floor(scrollTop / rowHeight);
  }, [scrollTop, rowHeight]);

  const endRow = useMemo(() => {
    return Math.min(
      startRow + Math.ceil(containerHeight / rowHeight) + overscan,
      totalRows - 1
    );
  }, [startRow, containerHeight, rowHeight, overscan, totalRows]);

  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, startRow - overscan) * itemsPerRow;
    const endIndex = Math.min((endRow + 1) * itemsPerRow, items.length);
    return items.slice(startIndex, endIndex);
  }, [items, startRow, endRow, overscan, itemsPerRow]);

  const offsetY = useMemo(() => {
    return Math.max(0, startRow - overscan) * rowHeight;
  }, [startRow, overscan, rowHeight]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={scrollElementRef}
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalRows * rowHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            display: 'grid',
            gridTemplateColumns: `repeat(${itemsPerRow}, ${itemWidth}px)`,
            gap: gap,
            justifyContent: 'center',
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = Math.max(0, startRow - overscan) * itemsPerRow + index;
            return (
              <div key={actualIndex}>
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Hook para virtual scrolling automático
export function useVirtualScroll({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 5,
}: {
  itemCount: number;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    itemCount - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleRange = { startIndex, endIndex };
  const totalHeight = itemCount * itemHeight;

  return {
    visibleRange,
    totalHeight,
    scrollTop,
    setScrollTop,
  };
}

// Componente especializado para productos
interface ProductVirtualGridProps<T> {
  products: T[];
  renderProduct: (product: T, index: number) => React.ReactNode;
  className?: string;
  onLoadMore?: () => void;
  loading?: boolean;
}

export function ProductVirtualGrid<T>({
  products,
  renderProduct,
  className,
  onLoadMore,
  loading = false,
}: ProductVirtualGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Observar cambios de tamaño del contenedor
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ width, height });
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Configuración responsive para tarjetas de producto
  const getItemSize = useCallback(() => {
    const { width } = containerSize;
    if (width < 640) return { itemWidth: width - 32, itemHeight: 400 }; // móvil
    if (width < 1024) return { itemWidth: (width - 48) / 2, itemHeight: 450 }; // tablet
    if (width < 1280) return { itemWidth: (width - 64) / 3, itemHeight: 500 }; // desktop
    return { itemWidth: (width - 80) / 4, itemHeight: 500 }; // desktop grande
  }, [containerSize]);

  const { itemWidth, itemHeight } = getItemSize();

  // Detectar cuando se acerca al final para cargar más
  const handleScroll = useCallback((scrollTop: number) => {
    if (!onLoadMore || loading) return;
    
    const { height } = containerSize;
    const totalHeight = Math.ceil(products.length / Math.floor((containerSize.width + 16) / (itemWidth + 16))) * (itemHeight + 16);
    
    if (scrollTop + height > totalHeight - 1000) {
      onLoadMore();
    }
  }, [onLoadMore, loading, containerSize, products.length, itemWidth, itemHeight]);

  if (containerSize.width === 0) {
    return <div ref={containerRef} className={cn("w-full h-full", className)} />;
  }

  return (
    <div ref={containerRef} className={cn("w-full h-full", className)}>
      <VirtualGrid
        items={products}
        itemWidth={itemWidth}
        itemHeight={itemHeight}
        containerWidth={containerSize.width}
        containerHeight={containerSize.height}
        renderItem={renderProduct}
        gap={16}
        overscan={3}
      />
      
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="ml-2 text-muted-foreground">Cargando más productos...</span>
        </div>
      )}
    </div>
  );
}