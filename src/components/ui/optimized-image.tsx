'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
  aspectRatio?: number;
}

export function OptimizedImage({
  src,
  alt,
  className,
  fallbackSrc = '/assets/placeholder.jpg',
  aspectRatio = 1,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Generar URLs optimizadas para Netlify Image CDN
  const optimizedSrc = typeof src === 'string' && src.startsWith('/assets/') 
    ? `/.netlify/images?url=${encodeURIComponent(src)}&w=${props.width || 800}&q=85&fm=webp`
    : src;
  
  return (
    <div 
      className={cn('relative overflow-hidden bg-muted', className)}
      style={{ aspectRatio }}
    >
      {/* Skeleton loader */}
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-muted to-muted-foreground/10" />
      )}
      
      <Image
        {...props}
        src={hasError ? fallbackSrc : optimizedSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        loading="lazy"
        quality={85}
      />
    </div>
  );
}

// Componente para galería de productos con optimizaciones
export function ProductGallery({ images }: { images: string[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  return (
    <div className="space-y-4">
      {/* Imagen principal */}
      <OptimizedImage
        src={images[selectedIndex]}
        alt="Producto"
        width={800}
        height={800}
        priority
        className="w-full rounded-lg"
      />
      
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                'relative rounded-md overflow-hidden border-2 transition-all',
                selectedIndex === index 
                  ? 'border-primary' 
                  : 'border-transparent hover:border-muted-foreground'
              )}
            >
              <OptimizedImage
                src={image}
                alt={`Vista ${index + 1}`}
                width={200}
                height={200}
                className="w-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}