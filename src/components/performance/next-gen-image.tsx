"use client";

import Image from 'next/image';
import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface NextGenImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: (error: any) => void;
  enableWebP?: boolean;
  enableAVIF?: boolean;
  fallbackFormats?: string[];
}

export function NextGenImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
  className,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
  enableWebP = true,
  enableAVIF = true,
  fallbackFormats = ['webp', 'jpg'],
}: NextGenImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const pictureRef = useRef<HTMLDivElement>(null);

  // Generar URLs para diferentes formatos
  const generateImageUrl = useCallback((originalSrc: string, format: string, qualityOverride?: number) => {
    const currentQuality = qualityOverride || quality;
    
    // Para imágenes de Supabase
    if (originalSrc.includes('supabase')) {
      const baseUrl = originalSrc.split('?')[0];
      const params = new URLSearchParams();
      
      // Agregar parámetros de optimización
      if (width && !fill) params.set('width', width.toString());
      if (height && !fill) params.set('height', height.toString());
      params.set('quality', currentQuality.toString());
      params.set('format', format);
      params.set('resize', 'cover');
      
      return `${baseUrl}?${params.toString()}`;
    }
    
    // Para otras imágenes, agregar parámetros query estándar
    const separator = originalSrc.includes('?') ? '&' : '?';
    let url = `${originalSrc}${separator}format=${format}&q=${currentQuality}`;
    
    if (width && !fill) url += `&w=${width}`;
    if (height && !fill) url += `&h=${height}`;
    
    return url;
  }, [quality, width, height, fill]);

  // Detectar soporte para formatos modernos
  const checkFormatSupport = useCallback((format: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(false);
        return;
      }

      // Cache de soporte de formatos
      const supportCache = (window as any).__formatSupportCache || {};
      if (supportCache[format] !== undefined) {
        resolve(supportCache[format]);
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(false);
        return;
      }

      const testImages: Record<string, string> = {
        webp: 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA',
        avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
      };

      const img = new Image();
      img.onload = () => {
        const supported = img.width === 1 && img.height === 1;
        supportCache[format] = supported;
        (window as any).__formatSupportCache = supportCache;
        resolve(supported);
      };
      img.onerror = () => {
        supportCache[format] = false;
        (window as any).__formatSupportCache = supportCache;
        resolve(false);
      };
      
      img.src = testImages[format] || '';
    });
  }, []);

  // Obtener la mejor fuente disponible
  const getBestSource = useCallback(async () => {
    const formats = [];
    
    if (enableAVIF && await checkFormatSupport('avif')) {
      formats.push('avif');
    }
    
    if (enableWebP && await checkFormatSupport('webp')) {
      formats.push('webp');
    }
    
    // Agregar formatos de fallback
    formats.push(...fallbackFormats);
    
    // Usar el primer formato soportado
    const selectedFormat = formats[0] || 'jpg';
    return generateImageUrl(src, selectedFormat);
  }, [src, enableAVIF, enableWebP, fallbackFormats, checkFormatSupport, generateImageUrl]);

  // Efecto para determinar la mejor fuente
  useEffect(() => {
    if (hasError) return;
    
    getBestSource().then(bestSrc => {
      setCurrentSrc(bestSrc);
    }).catch(() => {
      setCurrentSrc(src); // Fallback a la imagen original
    });
  }, [src, getBestSource, hasError]);

  // Manejar carga de imagen
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  // Manejar errores con fallback en cascada
  const handleError = useCallback(async (error: any) => {
    console.warn('Image failed to load:', currentSrc, error);
    
    // Intentar con el siguiente formato en la lista de fallback
    const currentIndex = fallbackFormats.findIndex(format => 
      currentSrc.includes(`format=${format}`)
    );
    
    if (currentIndex < fallbackFormats.length - 1) {
      const nextFormat = fallbackFormats[currentIndex + 1];
      const fallbackSrc = generateImageUrl(src, nextFormat);
      setCurrentSrc(fallbackSrc);
      return;
    }
    
    // Si todos los formatos fallan, usar la imagen original
    if (currentSrc !== src) {
      setCurrentSrc(src);
      return;
    }
    
    // Error final
    setHasError(true);
    onError?.(error);
  }, [currentSrc, src, fallbackFormats, generateImageUrl, onError]);

  // Generar blur placeholder
  const generateBlurDataURL = useCallback(() => {
    if (blurDataURL) return blurDataURL;
    
    // SVG blur placeholder
    const svg = `
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f1f5f9;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)" />
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }, [blurDataURL]);

  // Renderizar imagen con fallback de error
  if (hasError) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-muted/30 text-muted-foreground border border-border/20 rounded-lg",
        fill ? "absolute inset-0" : "w-full h-full min-h-[200px]",
        className
      )}>
        <div className="text-center p-4">
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm">Error al cargar imagen</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={pictureRef} className={cn("relative", !fill && "w-full h-full")}>
      {/* Componente Picture para soporte nativo de múltiples formatos */}
      <picture className={cn("block", fill && "absolute inset-0")}>
        {/* Source para AVIF si está habilitado */}
        {enableAVIF && (
          <source
            srcSet={generateImageUrl(src, 'avif')}
            type="image/avif"
            sizes={sizes}
          />
        )}
        
        {/* Source para WebP si está habilitado */}
        {enableWebP && (
          <source
            srcSet={generateImageUrl(src, 'webp')}
            type="image/webp"
            sizes={sizes}
          />
        )}
        
        {/* Imagen principal con Next.js Image para optimizaciones */}
        <Image
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          fill={fill}
          sizes={sizes}
          priority={priority}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={generateBlurDataURL()}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      </picture>
      
      {/* Loading indicator */}
      {!isLoaded && !hasError && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center bg-muted/20",
          "animate-pulse"
        )}>
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

// Hook para detección de soporte de formatos
export function useImageFormatSupport() {
  const [supportedFormats, setSupportedFormats] = useState<Record<string, boolean>>({});
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSupport = async () => {
      const formats = ['webp', 'avif'];
      const results: Record<string, boolean> = {};

      for (const format of formats) {
        results[format] = await checkFormatSupport(format);
      }

      setSupportedFormats(results);
      setIsChecking(false);
    };

    checkSupport();
  }, []);

  const checkFormatSupport = (format: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(false);
        return;
      }

      const testImages: Record<string, string> = {
        webp: 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA',
        avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
      };

      const img = new Image();
      img.onload = () => resolve(img.width === 1 && img.height === 1);
      img.onerror = () => resolve(false);
      img.src = testImages[format] || '';
    });
  };

  return {
    supportedFormats,
    isChecking,
    supportsWebP: supportedFormats.webp || false,
    supportsAVIF: supportedFormats.avif || false,
  };
}