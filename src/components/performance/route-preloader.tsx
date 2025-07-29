"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Mapeo de rutas a recursos críticos
const routeResources = {
  '/': [
    { href: '/assets/logo.webp', as: 'image', type: 'image/webp' }
  ],
  '/productos': [
    { href: '/api/products', as: 'fetch' }
  ],
  '/admin': [
    { href: '/api/admin/stats', as: 'fetch' }
  ]
} as const;

// Preloading dinámico de rutas
const routePreloading = {
  '/': ['/productos', '/nosotros'],
  '/productos': ['/productos/[id]'],
  '/nosotros': ['/productos']
} as const;

export function RoutePreloader() {
  const pathname = usePathname();

  useEffect(() => {
    // Preload recursos específicos de la ruta actual
    const currentResources = routeResources[pathname as keyof typeof routeResources];
    
    if (currentResources) {
      currentResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource.href;
        if (resource.as) link.as = resource.as;
        if (resource.as === 'image' && resource.type) link.type = resource.type;
        
        // Evitar duplicados
        const existing = document.querySelector(`link[href="${resource.href}"]`);
        if (!existing) {
          document.head.appendChild(link);
        }
      });
    }

    // Prefetch rutas relacionadas cuando el browser esté idle
    const relatedRoutes = routePreloading[pathname as keyof typeof routePreloading];
    
    if (relatedRoutes && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        relatedRoutes.forEach(route => {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = route;
          
          const existing = document.querySelector(`link[rel="prefetch"][href="${route}"]`);
          if (!existing) {
            document.head.appendChild(link);
          }
        });
      }, { timeout: 2000 });
    }

  }, [pathname]);

  return null;
}

// Hook para preloading de componentes específicos - Versión simplificada sin dynamic imports
export function useComponentPreloading(condition: boolean, componentPaths: string[]) {
  useEffect(() => {
    if (!condition || typeof window === 'undefined') return;

    // Solo hacer prefetch de rutas, no imports dinámicos para evitar critical dependency
    const preloadRoutes = () => {
      componentPaths.forEach(route => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        
        const existing = document.querySelector(`link[rel="prefetch"][href="${route}"]`);
        if (!existing) {
          document.head.appendChild(link);
        }
      });
    };

    // Preload cuando el browser esté idle
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(preloadRoutes, { timeout: 5000 });
    } else {
      setTimeout(preloadRoutes, 1000);
    }

  }, [condition, componentPaths]);
}