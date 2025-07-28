"use client";

import { useEffect } from 'react';

interface ProductPreloaderProps {
  productImageUrl: string;
  relatedCategory: string;
}

export function ProductPreloader({ productImageUrl, relatedCategory }: ProductPreloaderProps) {
  useEffect(() => {
    // Preload de imagen del producto principal
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = productImageUrl;
    link.as = 'image';
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);

    // Preload de componentes que se van a necesitar
    import('@/components/shop/add-to-cart-button').catch(() => {});
    import('@/components/shop/add-to-wishlist-button').catch(() => {});
    
    // Los productos relacionados se cargan desde el servidor, no necesitamos preload

    return () => {
      document.head.removeChild(link);
    };
  }, [productImageUrl, relatedCategory]);

  return null;
}