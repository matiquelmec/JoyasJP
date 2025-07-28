"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useDeviceType } from '@/hooks/use-mobile';

// Preloader inteligente que carga recursos basado en la ruta actual y dispositivo
export default function ResourcePreloader() {
  const pathname = usePathname();
  const { deviceType, connectionType } = useDeviceType();

  useEffect(() => {
    // Deshabilitar completamente el Service Worker y limpiar cache
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Primero desregistrar cualquier SW existente
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
          console.log('SW existente desregistrado');
        });
      });
      
      // Escuchar mensajes del SW para desregistrarlo cuando termine la limpieza
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SW_DISABLE') {
          navigator.serviceWorker.ready.then(registration => {
            registration.unregister();
            console.log('SW desregistrado después de limpieza de cache');
          });
        }
      });
      
      // Registrar el SW de limpieza una vez
      navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
        .then(() => console.log('SW de limpieza registrado'))
        .catch(error => console.log('Error SW:', error));
    }
    
    // Preload crítico para todas las páginas
    preloadCriticalResources();

    // Preload específico por ruta y dispositivo
    if (pathname === '/') {
      preloadHomeResources(deviceType, connectionType);
    } else if (pathname === '/productos') {
      preloadProductsResources(deviceType, connectionType);
    } else if (pathname.startsWith('/productos/')) {
      preloadProductDetailResources(deviceType, connectionType);
    } else if (pathname.startsWith('/admin')) {
      preloadAdminResources(deviceType, connectionType);
    }

  }, [pathname, deviceType, connectionType]);

  return null; // Este componente no renderiza nada
}

function preloadCriticalResources() {
  // Solo preload de recursos que sabemos que existen
  // Eliminamos font preload ya que puede no existir
  
  // No preload CSS específico ya que Next.js lo maneja automáticamente
}

function preloadHomeResources(deviceType: 'mobile' | 'tablet' | 'desktop', connectionType: 'slow' | 'fast') {
  // En móvil con conexión lenta, solo preload crítico
  if (deviceType === 'mobile' && connectionType === 'slow') {
    return; // No preload adicional en móvil con conexión lenta
  }
  
  // Preload componentes que se mostrarán
  import('@/components/shop/product-card').catch(() => {});
}

function preloadProductsResources(deviceType: 'mobile' | 'tablet' | 'desktop', connectionType: 'slow' | 'fast') {
  // En móvil, priorizar menos recursos
  if (deviceType === 'mobile') {
    // Solo preload crítico en móvil
    import('@/components/shop/product-card').catch(() => {});
    return;
  }
  
  // En desktop, preload adicional
  import('@/components/shop/product-card').catch(() => {});
  import('@/components/ui/badge').catch(() => {});
}

function preloadProductDetailResources(deviceType: 'mobile' | 'tablet' | 'desktop', connectionType: 'slow' | 'fast') {
  // Preload básico siempre
  import('@/components/shop/add-to-cart-button').catch(() => {});
  
  // Solo en desktop o conexión rápida preload adicional
  if (deviceType !== 'mobile' || connectionType === 'fast') {
    import('@/components/shop/add-to-wishlist-button').catch(() => {});
    import('@/components/shop/related-products').catch(() => {});
  }
}

function preloadAdminResources(deviceType: 'mobile' | 'tablet' | 'desktop', connectionType: 'slow' | 'fast') {
  // Admin panel - solo preload si está autenticado y no es móvil con conexión lenta
  if (typeof window !== 'undefined' && localStorage.getItem('admin-token')) {
    if (!(deviceType === 'mobile' && connectionType === 'slow')) {
      import('@/components/admin/admin-layout').catch(() => {});
      import('@/components/admin/dashboard-stats').catch(() => {});
    }
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