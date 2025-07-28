"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Preloader inteligente que carga recursos basado en la ruta actual
export default function ResourcePreloader() {
  const pathname = usePathname();

  useEffect(() => {
    // Temporalmente registrar SW para limpiar cache legacy y luego desregistrar
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => {
          console.log('SW registrado para limpieza de cache');
          // Después de 5 segundos, desregistrar el SW
          setTimeout(() => {
            navigator.serviceWorker.ready.then(registration => {
              registration.unregister();
              console.log('SW desregistrado después de limpieza');
            });
          }, 5000);
        })
        .catch(error => console.log('Error SW:', error));
    }
    
    // Preload crítico para todas las páginas
    preloadCriticalResources();

    // Preload específico por ruta
    if (pathname === '/') {
      preloadHomeResources();
    } else if (pathname === '/productos') {
      preloadProductsResources();
    } else if (pathname.startsWith('/productos/')) {
      preloadProductDetailResources();
    } else if (pathname.startsWith('/admin')) {
      preloadAdminResources();
    }

  }, [pathname]);

  return null; // Este componente no renderiza nada
}

function preloadCriticalResources() {
  // Solo preload de recursos que sabemos que existen
  // Eliminamos font preload ya que puede no existir
  
  // No preload CSS específico ya que Next.js lo maneja automáticamente
}

function preloadHomeResources() {
  // Preload componentes que se mostrarán (la API ya se llama en el servidor)
  import('@/components/shop/product-card').catch(() => {});
}

function preloadProductsResources() {
  // Solo preload de componentes (las APIs ya se llaman en el servidor)
  import('@/components/shop/product-card').catch(() => {});
}

function preloadProductDetailResources() {
  // Preload componentes de detalle
  import('@/components/shop/product-detail-view').catch(() => {});
  import('@/components/shop/related-products').catch(() => {});
}

function preloadAdminResources() {
  // Preload componentes admin (solo si es necesario)
  if (typeof window !== 'undefined' && localStorage.getItem('admin-token')) {
    import('@/components/admin/admin-layout').catch(() => {});
    import('@/components/admin/dashboard-stats').catch(() => {});
  }
}

// Hook para preload manual de recursos
export function useResourcePreload() {
  const preloadImage = (src: string, priority: 'high' | 'low' = 'high') => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = src;
    link.as = 'image';
    if (priority === 'high') {
      link.setAttribute('fetchpriority', 'high');
    }
    document.head.appendChild(link);
  };

  const preloadRoute = (href: string) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  };

  return { preloadImage, preloadRoute };
}