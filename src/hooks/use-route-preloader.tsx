"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useCallback, useState, createContext, useContext } from 'react';
import React from 'react';

interface PreloadConfig {
  delay?: number;
  priority?: boolean;
  prefetchOnHover?: boolean;
  prefetchOnVisible?: boolean;
}

// Hook principal para preloading inteligente
export function useRoutePreloader() {
  const router = useRouter();
  const [preloadedRoutes, setPreloadedRoutes] = useState<Set<string>>(new Set());

  const preloadRoute = useCallback(
    (href: string, config: PreloadConfig = {}) => {
      const { delay = 0, priority = false } = config;

      // Evitar precargar la misma ruta múltiples veces
      if (preloadedRoutes.has(href)) return;

      const doPreload = () => {
        try {
          router.prefetch(href);
          setPreloadedRoutes(prev => new Set([...prev, href]));
          console.log(`🚀 Route preloaded: ${href}`);
        } catch (error) {
          console.warn(`Failed to preload route: ${href}`, error);
        }
      };

      if (delay > 0 && !priority) {
        setTimeout(doPreload, delay);
      } else {
        doPreload();
      }
    },
    [router, preloadedRoutes]
  );

  // Precargar rutas críticas al inicio
  const preloadCriticalRoutes = useCallback(() => {
    const criticalRoutes = [
      '/productos',
      '/nosotros',
      '/contacto',
      '/favoritos',
      '/checkout'
    ];

    criticalRoutes.forEach((route, index) => {
      preloadRoute(route, { 
        delay: index * 200, // Stagger preloading
        priority: index === 0 
      });
    });
  }, [preloadRoute]);

  return {
    preloadRoute,
    preloadCriticalRoutes,
    preloadedRoutes: Array.from(preloadedRoutes),
  };
}

// Hook para preloading con hover
export function useHoverPreload(href: string, enabled: boolean = true) {
  const { preloadRoute } = useRoutePreloader();

  const handleMouseEnter = useCallback(() => {
    if (enabled) {
      preloadRoute(href, { priority: true });
    }
  }, [href, enabled, preloadRoute]);

  return { handleMouseEnter };
}

// Hook para preloading con intersection observer
export function useVisibilityPreload(href: string, enabled: boolean = true) {
  const { preloadRoute } = useRoutePreloader();
  const [ref, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref || !enabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          preloadRoute(href, { delay: 100 });
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, href, enabled, preloadRoute]);

  return setRef;
}

// Hook para preloading inteligente basado en patrones de usuario
export function useSmartPreloader() {
  const { preloadRoute } = useRoutePreloader();
  const [userPatterns, setUserPatterns] = useState<Map<string, number>>(new Map());

  // Registrar visitas a rutas
  const registerVisit = useCallback((route: string) => {
    setUserPatterns(prev => {
      const newPatterns = new Map(prev);
      const currentCount = newPatterns.get(route) || 0;
      newPatterns.set(route, currentCount + 1);
      return newPatterns;
    });
  }, []);

  // Precargar rutas basado en patrones
  const preloadByPatterns = useCallback(() => {
    // Ordenar rutas por frecuencia de visita
    const sortedRoutes = Array.from(userPatterns.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5); // Top 5 rutas más visitadas

    sortedRoutes.forEach(([route], index) => {
      preloadRoute(route, { delay: index * 300 });
    });
  }, [userPatterns, preloadRoute]);

  // Predicciones basadas en ruta actual
  const predictNextRoutes = useCallback((currentRoute: string): string[] => {
    const predictions: Record<string, string[]> = {
      '/': ['/productos', '/nosotros'],
      '/productos': ['/productos/[id]', '/favoritos', '/checkout'],
      '/productos/[id]': ['/checkout', '/productos', '/favoritos'],
      '/checkout': ['/productos/success', '/productos/failure'],
      '/favoritos': ['/productos', '/checkout'],
    };

    return predictions[currentRoute] || [];
  }, []);

  return {
    registerVisit,
    preloadByPatterns,
    predictNextRoutes,
    userPatterns: Object.fromEntries(userPatterns),
  };
}

// Hook para preloading de productos relacionados
export function useProductPreloader() {
  const { preloadRoute } = useRoutePreloader();

  const preloadRelatedProducts = useCallback((productIds: string[]) => {
    productIds.forEach((id, index) => {
      preloadRoute(`/productos/${id}`, { delay: index * 100 });
    });
  }, [preloadRoute]);

  const preloadProductImages = useCallback((imageUrls: string[]) => {
    // Precargar imágenes de productos
    imageUrls.forEach((url, index) => {
      setTimeout(() => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = url;
        document.head.appendChild(link);

        // Limpiar después de 30 segundos
        setTimeout(() => {
          if (document.head.contains(link)) {
            document.head.removeChild(link);
          }
        }, 30000);
      }, index * 50);
    });
  }, []);

  return {
    preloadRelatedProducts,
    preloadProductImages,
  };
}

// Componente wrapper para preloading automático
interface SmartLinkProps {
  href: string;
  children: React.ReactNode;
  preloadOnHover?: boolean;
  preloadOnVisible?: boolean;
  preloadDelay?: number;
  className?: string;
  onClick?: () => void;
}

export function SmartLink({
  href,
  children,
  preloadOnHover = true,
  preloadOnVisible = false,
  preloadDelay = 0,
  className,
  onClick,
}: SmartLinkProps) {
  const { handleMouseEnter } = useHoverPreload(href, preloadOnHover);
  const setVisibilityRef = useVisibilityPreload(href, preloadOnVisible);

  return (
    <a
      href={href}
      className={className}
      onMouseEnter={preloadOnHover ? handleMouseEnter : undefined}
      ref={preloadOnVisible ? setVisibilityRef : undefined}
      onClick={onClick}
    >
      {children}
    </a>
  );
}

// Context para estado global de preloading
interface PreloadContextType {
  isPreloading: boolean;
  preloadedRoutes: string[];
  preloadProgress: number;
}

const PreloadContext = createContext<PreloadContextType>({
  isPreloading: false,
  preloadedRoutes: [],
  preloadProgress: 0,
});

export function PreloadProvider({ children }: { children: React.ReactNode }) {
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const { preloadedRoutes, preloadCriticalRoutes } = useRoutePreloader();

  useEffect(() => {
    // Precargar rutas críticas al montar la aplicación
    const timer = setTimeout(() => {
      setIsPreloading(true);
      preloadCriticalRoutes();
      
      // Simular progreso de precarga
      let progress = 0;
      const progressTimer = setInterval(() => {
        progress += 20;
        setPreloadProgress(progress);
        
        if (progress >= 100) {
          clearInterval(progressTimer);
          setIsPreloading(false);
        }
      }, 200);
    }, 1000);

    return () => clearTimeout(timer);
  }, [preloadCriticalRoutes]);

  const value = {
    isPreloading,
    preloadedRoutes,
    preloadProgress,
  };

  return (
    <PreloadContext.Provider value={value}>
      {children}
    </PreloadContext.Provider>
  );
}

export const usePreloadContext = () => {
  const context = useContext(PreloadContext);
  if (!context) {
    throw new Error('usePreloadContext must be used within PreloadProvider');
  }
  return context;
};