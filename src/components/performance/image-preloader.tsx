"use client";

import { useEffect } from 'react';

interface ImagePreloaderProps {
  images: string[];
  priority?: boolean;
}

export function ImagePreloader({ images, priority = false }: ImagePreloaderProps) {
  useEffect(() => {
    if (!images.length) return;

    // Precargar solo si la conexión es rápida - INCLUYE 3G
    const connection = (navigator as any).connection;
    const isSlowConnection = connection && (
      connection.effectiveType === 'slow-2g' || 
      connection.effectiveType === '2g' ||
      connection.effectiveType === '3g' ||  // ✅ AGREGADO: 3G también es lento
      connection.saveData
    );

    // En conexiones lentas, precargar solo la primera imagen
    const imagesToPreload = isSlowConnection && !priority 
      ? images.slice(0, 1) 
      : images;

    const preloadPromises = imagesToPreload.map((src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        
        // Configurar sizes apropiados para preloading
        img.sizes = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw';
        
        // Usar la imagen tal como viene, sin modificar formato
        img.src = src;
      });
    });

    // Precargar todas las imágenes
    Promise.allSettled(preloadPromises)
      .then((results) => {
        const loaded = results.filter(r => r.status === 'fulfilled').length;
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`Preloaded ${loaded}/${imagesToPreload.length} images`);
        }
      })
      .catch((error) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Some images failed to preload:', error);
        }
      });

  }, [images, priority]);

  return null; // Este componente no renderiza nada
}

// Hook para preloading inteligente
export function useImagePreloader(images: string[], condition: boolean = true) {
  useEffect(() => {
    if (!condition || !images.length) return;

    // Usar requestIdleCallback para precargar cuando el browser esté idle
    const preloadWhenIdle = (callback: () => void) => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(callback, { timeout: 2000 });
      } else {
        // Fallback para browsers que no soportan requestIdleCallback
        setTimeout(callback, 100);
      }
    };

    preloadWhenIdle(() => {
      images.forEach((src) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        link.type = 'image/webp';
        document.head.appendChild(link);
        
        // Limpiar después de 30 segundos
        setTimeout(() => {
          if (document.head.contains(link)) {
            document.head.removeChild(link);
          }
        }, 30000);
      });
    });

  }, [images, condition]);
}