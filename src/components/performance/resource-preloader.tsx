"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { registerServiceWorker } from '@/lib/service-worker';

// Preloader inteligente que carga recursos basado en la ruta actual
export default function ResourcePreloader() {
  const pathname = usePathname();

  useEffect(() => {
    // Registrar Service Worker
    registerServiceWorker();
    
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
  // Preload de fuentes críticas
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = '/fonts/inter-var.woff2';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink);

  // Preload de CSS crítico
  const cssLink = document.createElement('link');
  cssLink.rel = 'preload';
  cssLink.href = '/_next/static/css/app.css';
  cssLink.as = 'style';
  document.head.appendChild(cssLink);
}

function preloadHomeResources() {
  // Preload productos destacados API
  fetch('/api/products?featured=true', { 
    method: 'GET',
    headers: { 'Priority': 'u=1' }
  }).catch(() => {}); // Silent fail

  // Preload componentes que se mostrarán
  import('@/components/shop/product-card').catch(() => {});
}

function preloadProductsResources() {
  // Preload productos API
  fetch('/api/products', { 
    method: 'GET',
    headers: { 'Priority': 'u=0' }
  }).catch(() => {});

  // Preload colores API  
  fetch('/api/colors', { 
    method: 'GET',
    headers: { 'Priority': 'u=2' }
  }).catch(() => {});
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