/**
 * Sistema de optimización de imágenes con blur placeholders
 * Mejora LCP y experiencia de carga
 */

// Generar blur placeholder dinámico
export function getBlurDataURL(dominantColor: string = '#27272a'): string {
  // SVG blur placeholder ultra-ligero (< 1KB)
  const svg = `
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <filter id="b" color-interpolation-filters="sRGB">
        <feGaussianBlur stdDeviation="20"/>
      </filter>
      <rect width="100%" height="100%" fill="${dominantColor}" filter="url(#b)"/>
    </svg>
  `
  
  const base64 = Buffer.from(svg).toString('base64')
  return `data:image/svg+xml;base64,${base64}`
}

// Configuración optimizada para diferentes tipos de imágenes
export const imageConfig = {
  // Para productos - máxima calidad
  product: {
    quality: 85,
    blur: getBlurDataURL('#27272a'),
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  },
  
  // Para hero images - calidad alta
  hero: {
    quality: 90,
    blur: getBlurDataURL('#1a1a1a'),
    sizes: '100vw',
  },
  
  // Para thumbnails - optimización agresiva
  thumbnail: {
    quality: 75,
    blur: getBlurDataURL('#3f3f46'),
    sizes: '(max-width: 640px) 50vw, 25vw',
  },
} as const

// Hook para lazy loading con Intersection Observer
export function useLazyLoad() {
  if (typeof window === 'undefined') return { supported: false }
  
  return {
    supported: 'IntersectionObserver' in window,
    rootMargin: '50px', // Precargar 50px antes de entrar en viewport
    threshold: 0.01,
  }
}