"use client";

import Image from 'next/image';
import { useState } from 'react';
import { useMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  className,
  priority = false,
  fill = false,
  width,
  height,
  sizes,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const { isMobile, isLoading } = useMobile();
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Sizes optimizados por dispositivo
  const optimizedSizes = sizes || (
    isMobile 
      ? "(max-width: 480px) 100vw, (max-width: 640px) 50vw, 33vw"
      : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
  );

  const handleLoad = () => {
    console.log("OptimizedImage: Image loaded successfully.");
    setIsImageLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    console.error("OptimizedImage: Image failed to load.");
    setIsImageLoading(false);
    setHasError(true);
    onError?.();
  };

  // Mientras detectamos el dispositivo, mostrar placeholder
  if (isLoading) {
    return (
      <div className={cn("bg-muted animate-pulse", className)}>
        <div className="w-full h-full bg-gradient-to-br from-muted/40 via-muted/20 to-muted/40" />
      </div>
    );
  }

  // Si hay error, mostrar fallback
  if (hasError) {
    return (
      <div className={cn("bg-muted/30 flex items-center justify-center", className)}>
        <div className="text-muted-foreground text-sm">
          Imagen no disponible
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Loading overlay */}
      {isImageLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted/40 via-muted/20 to-muted/40 animate-pulse z-10" />
      )}
      
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={optimizedSizes}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        quality={isMobile ? 75 : 85} // Menor calidad en móvil para velocidad
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "object-cover transition-all duration-300",
          isImageLoading ? "scale-105" : "scale-100 opacity-100"
        )}
        {...props}
      />
    </div>
  );
}