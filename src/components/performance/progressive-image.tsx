"use client";

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ProgressiveImageProps {
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
}

export function ProgressiveImage({
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
}: ProgressiveImageProps) {
  const [imageState, setImageState] = useState<'loading' | 'low' | 'high' | 'error'>('loading');
  const [hasError, setHasError] = useState(false);

  // Generar URLs para diferentes calidades
  const getLowQualityUrl = useCallback((url: string) => {
    if (url.includes('supabase')) {
      // Para imágenes de Supabase, usar parámetros de transformación
      return `${url}?width=300&height=300&resize=cover&quality=30&format=webp`;
    }
    // Para otras imágenes, agregar parámetros query estándar
    return `${url}${url.includes('?') ? '&' : '?'}w=300&q=30`;
  }, []);

  const getHighQualityUrl = useCallback((url: string) => {
    if (url.includes('supabase')) {
      return `${url}?width=800&height=800&resize=cover&quality=${quality}&format=webp`;
    }
    return `${url}${url.includes('?') ? '&' : '?'}q=${quality}`;
  }, [quality]);

  // Generar blur placeholder simple
  const generateBlurDataURL = useCallback(() => {
    // SVG blur placeholder minimalista
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
  }, []);

  const handleLowQualityLoad = useCallback(() => {
    setImageState('low');
    
    // Precargar imagen de alta calidad
    const highQualityImg = new window.Image();
    highQualityImg.onload = () => {
      setImageState('high');
      onLoad?.();
    };
    highQualityImg.onerror = (error) => {
      setHasError(true);
      setImageState('error');
      onError?.(error);
    };
    highQualityImg.src = getHighQualityUrl(src);
  }, [src, getHighQualityUrl, onLoad, onError]);

  const handleError = useCallback((error: any) => {
    setHasError(true);
    setImageState('error');
    onError?.(error);
  }, [onError]);

  const blurData = blurDataURL || generateBlurDataURL();

  if (hasError) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-muted/30 text-muted-foreground",
        fill ? "absolute inset-0" : "w-full h-full",
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
    <>
      {/* Imagen progresiva: baja calidad primero, luego alta calidad */}
      {(imageState === 'loading' || imageState === 'low' || imageState === 'high') && (
        <Image
          src={imageState === 'high' ? getHighQualityUrl(src) : getLowQualityUrl(src)}
          alt={alt}
          width={width}
          height={height}
          fill={fill}
          sizes={sizes}
          priority={priority}
          quality={imageState === 'high' ? quality : 30}
          placeholder={imageState === 'loading' ? placeholder : "empty"}
          blurDataURL={imageState === 'loading' ? blurData : undefined}
          className={cn(
            "transition-all duration-500",
            imageState === 'high' ? "opacity-100 scale-100" : 
            imageState === 'low' ? "opacity-80 scale-105" : 
            "opacity-0 scale-110",
            className
          )}
          onLoad={imageState === 'loading' ? handleLowQualityLoad : onLoad}
          onError={handleError}
        />
      )}
    </>
  );
}

// Hook para progressive loading
export function useProgressiveImage(src: string, options?: {
  lowQuality?: number;
  highQuality?: number;
  delay?: number;
}) {
  const [imageState, setImageState] = useState<'loading' | 'low' | 'high' | 'error'>('loading');
  const { lowQuality = 30, highQuality = 85, delay = 100 } = options || {};

  useEffect(() => {
    if (!src) return;

    // Cargar imagen de baja calidad primero
    const lowImg = new window.Image();
    lowImg.onload = () => {
      setImageState('low');
      
      // Después de un delay, cargar la imagen de alta calidad
      setTimeout(() => {
        const highImg = new window.Image();
        highImg.onload = () => setImageState('high');
        highImg.onerror = () => setImageState('error');
        highImg.src = `${src}?q=${highQuality}`;
      }, delay);
    };
    lowImg.onerror = () => setImageState('error');
    lowImg.src = `${src}?q=${lowQuality}&w=300`;

  }, [src, lowQuality, highQuality, delay]);

  return imageState;
}