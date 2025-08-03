'use client';

import { useState, memo } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';
import { useProductImage } from '@/hooks/use-image-load';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
  aspectRatio?: number;
  productName?: string;
}

export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  className,
  fallbackSrc = '/assets/placeholder.jpg',
  aspectRatio = 1,
  productName,
  ...props
}: OptimizedImageProps) {
  const { imageProps, isLoading, hasError } = useProductImage(
    typeof src === 'string' ? src : '', 
    productName
  );
  
  // Generar URLs optimizadas para Netlify Image CDN
  const optimizedSrc = typeof imageProps.src === 'string' && imageProps.src.startsWith('/assets/') 
    ? `/.netlify/images?url=${encodeURIComponent(imageProps.src)}&w=${props.width || 800}&q=85&fm=webp`
    : imageProps.src;
  
  return (
    <div 
      className={cn('relative overflow-hidden bg-muted', className)}
      style={{ aspectRatio }}
    >
      {/* Shimmer skeleton loader */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
      )}
      
      <Image
        {...props}
        src={hasError ? fallbackSrc : optimizedSrc}
        alt={alt}
        className={cn(
          'transition-all duration-300 ease-in-out object-cover',
          isLoading ? 'opacity-0 scale-110' : 'opacity-100 scale-100',
          hasError && 'grayscale',
          className
        )}
        onLoad={() => {
          imageProps.onLoad();
        }}
        onError={() => {
          imageProps.onError();
        }}
        loading={props.priority ? "eager" : "lazy"}
        quality={85}
      />

      {/* Error state with better UX */}
      {hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-400 p-2">
            <svg 
              className="mx-auto h-6 w-6 mb-1 opacity-50" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <span className="text-xs">Sin imagen</span>
          </div>
        </div>
      )}
    </div>
  );
});

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