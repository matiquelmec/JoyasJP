import { useState, useCallback, useRef, useEffect } from 'react';

interface UseImageLoadOptions {
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: (error: Event) => void;
}

interface UseImageLoadReturn {
  imageProps: {
    onLoad: () => void;
    onError: () => void;
    src: string;
  };
  isLoading: boolean;
  hasError: boolean;
  retry: () => void;
}

export function useImageLoad(
  src: string, 
  options: UseImageLoadOptions = {}
): UseImageLoadReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>();

  const { fallbackSrc, onLoad, onError } = options;

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback((event: Event | string) => {
    setIsLoading(false);
    setHasError(true);
    
    // Try fallback if available and not already using it
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setIsLoading(true);
      setHasError(false);
      return;
    }
    
    if (typeof event !== 'string') {
      onError?.(event);
    }
  }, [fallbackSrc, currentSrc, onError]);

  const retry = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
    setCurrentSrc(src);
  }, [src]);

  // Reset states when src changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setCurrentSrc(src);
  }, [src]);

  // Preload image
  useEffect(() => {
    if (!currentSrc) return;

    const img = new Image();
    imgRef.current = img;
    
    img.onload = handleLoad;
    img.onerror = (e) => handleError(e as Event);
    img.src = currentSrc;

    return () => {
      if (imgRef.current) {
        imgRef.current.onload = null;
        imgRef.current.onerror = null;
      }
    };
  }, [currentSrc, handleLoad, handleError]);

  return {
    imageProps: {
      onLoad: handleLoad,
      onError: () => handleError(new Event('error')),
      src: currentSrc,
    },
    isLoading,
    hasError,
    retry,
  };
}

// Hook específico para productos con fallbacks inteligentes
export function useProductImage(
  src: string, 
  productName?: string
): UseImageLoadReturn {
  const fallbackSrc = '/placeholder-product.jpg';
  
  return useImageLoad(src, {
    fallbackSrc,
    onError: (error) => {
      console.warn(`Failed to load image for ${productName || 'product'}:`, src);
    }
  });
}

// Hook para optimización de carga de imágenes en listas
export function useLazyImage(
  src: string,
  options: UseImageLoadOptions & { threshold?: number } = {}
): UseImageLoadReturn & { elementRef: React.RefObject<HTMLDivElement> } {
  const [isInView, setIsInView] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const { threshold = 0.1 } = options;

  // Intersection Observer para lazy loading
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  const imageLoad = useImageLoad(isInView ? src : '', options);

  return {
    ...imageLoad,
    elementRef,
    isLoading: !isInView || imageLoad.isLoading,
  };
}