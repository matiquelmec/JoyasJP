"use client";

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'text' | 'circle' | 'card' | 'product' | 'hero';
  animation?: 'pulse' | 'wave' | 'shimmer' | 'none';
  speed?: 'slow' | 'normal' | 'fast';
  lines?: number;
  width?: string | number;
  height?: string | number;
}

export function AdvancedSkeleton({
  className,
  variant = 'default',
  animation = 'shimmer',
  speed = 'normal',
  lines = 1,
  width,
  height,
}: SkeletonProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getAnimationClass = () => {
    const speedMap = {
      slow: 'duration-2000',
      normal: 'duration-1500',
      fast: 'duration-1000',
    };

    switch (animation) {
      case 'pulse':
        return `animate-pulse ${speedMap[speed]}`;
      case 'wave':
        return `animate-wave ${speedMap[speed]}`;
      case 'shimmer':
        return `animate-shimmer ${speedMap[speed]}`;
      default:
        return '';
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'circle':
        return 'rounded-full aspect-square';
      case 'card':
        return 'h-48 rounded-lg';
      case 'product':
        return 'h-64 rounded-lg';
      case 'hero':
        return 'h-96 rounded-xl';
      default:
        return 'h-4 rounded';
    }
  };

  const baseClasses = cn(
    'bg-gradient-to-r from-muted via-muted/80 to-muted',
    'relative overflow-hidden',
    getVariantStyles(),
    getAnimationClass(),
    className
  );

  // Renderizar múltiples líneas para texto
  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              index === lines - 1 && 'w-3/4' // Última línea más corta
            )}
            style={{
              width: typeof width === 'number' ? `${width}px` : width,
              height: typeof height === 'number' ? `${height}px` : height,
            }}
          >
            {animation === 'shimmer' && mounted && (
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={baseClasses}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    >
      {animation === 'shimmer' && mounted && (
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      )}
    </div>
  );
}

// Skeleton específico para tarjetas de producto
export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("border rounded-lg overflow-hidden shadow-sm", className)}>
      {/* Imagen del producto */}
      <AdvancedSkeleton
        variant="product"
        animation="shimmer"
        className="w-full aspect-square"
      />
      
      {/* Contenido */}
      <div className="p-4 space-y-3">
        {/* Título */}
        <AdvancedSkeleton
          variant="text"
          animation="shimmer"
          className="h-5 w-3/4"
        />
        
        {/* Descripción */}
        <AdvancedSkeleton
          variant="text"
          animation="shimmer"
          lines={2}
          className="h-4"
        />
        
        {/* Precio y botón */}
        <div className="flex items-center justify-between mt-4">
          <AdvancedSkeleton
            variant="text"
            animation="shimmer"
            className="h-6 w-20"
          />
          <AdvancedSkeleton
            variant="circle"
            animation="shimmer"
            className="w-10 h-10"
          />
        </div>
      </div>
    </div>
  );
}

// Skeleton para grid de productos
export function ProductGridSkeleton({ 
  count = 8, 
  className 
}: { 
  count?: number; 
  className?: string; 
}) {
  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
      className
    )}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

// Skeleton para hero section
export function HeroSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-[calc(100vh+9rem)] w-full", className)}>
      <AdvancedSkeleton
        variant="hero"
        animation="shimmer"
        className="absolute inset-0"
      />
      
      {/* Overlay de contenido */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-6 z-10">
        {/* Logo skeleton */}
        <AdvancedSkeleton
          variant="circle"
          animation="shimmer"
          className="w-24 h-24"
        />
        
        {/* Texto principal */}
        <AdvancedSkeleton
          variant="text"
          animation="shimmer"
          className="h-8 w-64"
        />
        
        {/* Subtítulo */}
        <AdvancedSkeleton
          variant="text"
          animation="shimmer"
          className="h-6 w-80"
        />
        
        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-4">
          <AdvancedSkeleton
            variant="default"
            animation="shimmer"
            className="h-12 w-40 rounded-lg"
          />
          <AdvancedSkeleton
            variant="default"
            animation="shimmer"
            className="h-12 w-40 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}

// Skeleton para navegación
export function NavigationSkeleton({ className }: { className?: string }) {
  return (
    <nav className={cn("flex items-center justify-between p-4", className)}>
      {/* Logo */}
      <AdvancedSkeleton
        variant="default"
        animation="shimmer"
        className="h-8 w-32"
      />
      
      {/* Links de navegación */}
      <div className="hidden md:flex space-x-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <AdvancedSkeleton
            key={index}
            variant="text"
            animation="shimmer"
            className="h-5 w-16"
          />
        ))}
      </div>
      
      {/* Acciones */}
      <div className="flex items-center space-x-3">
        <AdvancedSkeleton
          variant="circle"
          animation="shimmer"
          className="w-8 h-8"
        />
        <AdvancedSkeleton
          variant="circle"
          animation="shimmer"
          className="w-8 h-8"
        />
      </div>
    </nav>
  );
}

// Skeleton para detalle de producto
export function ProductDetailSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-8", className)}>
      {/* Galería de imágenes */}
      <div className="space-y-4">
        <AdvancedSkeleton
          variant="product"
          animation="shimmer"
          className="w-full aspect-square rounded-lg"
        />
        
        {/* Thumbnails */}
        <div className="flex space-x-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <AdvancedSkeleton
              key={index}
              variant="default"
              animation="shimmer"
              className="w-20 h-20 rounded-lg"
            />
          ))}
        </div>
      </div>
      
      {/* Información del producto */}
      <div className="space-y-6">
        {/* Título */}
        <AdvancedSkeleton
          variant="text"
          animation="shimmer"
          className="h-8 w-3/4"
        />
        
        {/* Precio */}
        <AdvancedSkeleton
          variant="text"
          animation="shimmer"
          className="h-10 w-32"
        />
        
        {/* Descripción */}
        <div className="space-y-2">
          <AdvancedSkeleton
            variant="text"
            animation="shimmer"
            lines={4}
            className="h-4"
          />
        </div>
        
        {/* Opciones */}
        <div className="space-y-4">
          <AdvancedSkeleton
            variant="text"
            animation="shimmer"
            className="h-5 w-20"
          />
          <div className="flex space-x-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <AdvancedSkeleton
                key={index}
                variant="default"
                animation="shimmer"
                className="h-10 w-16 rounded-lg"
              />
            ))}
          </div>
        </div>
        
        {/* Botones de acción */}
        <div className="flex space-x-3">
          <AdvancedSkeleton
            variant="default"
            animation="shimmer"
            className="h-12 flex-1 rounded-lg"
          />
          <AdvancedSkeleton
            variant="circle"
            animation="shimmer"
            className="w-12 h-12"
          />
        </div>
      </div>
    </div>
  );
}

// Hook para controlar cuándo mostrar skeletons
export function useSkeletonVisibility(delay: number = 200) {
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return showSkeleton;
}