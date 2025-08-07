'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedSupabaseImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  sizes?: string
  quality?: number
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

// ⚡ Supabase Storage no soporta transformaciones de imagen por URL
// Devolver la URL original para evitar problemas de carga
function getOptimizedSupabaseUrl(
  originalUrl: string, 
  width: number, 
  height: number, 
  quality = 80
): string {
  return originalUrl
}

// ⚡ Generar placeholder blur usando canvas
function generatePlaceholderDataURL(width: number, height: number): string {
  // Crear un SVG de placeholder con gradiente
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f1f5f9;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
      <circle cx="50%" cy="50%" r="20" fill="#cbd5e1" opacity="0.3"/>
    </svg>
  `
  
  const base64 = Buffer.from(svg).toString('base64')
  return `data:image/svg+xml;base64,${base64}`
}

export function OptimizedSupabaseImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes,
  quality = 80,
  objectFit = 'cover',
  placeholder = 'blur',
  blurDataURL
}: OptimizedSupabaseImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Obtener URL optimizada
  const optimizedSrc = getOptimizedSupabaseUrl(src, width, height, quality)
  
  // Generar placeholder si no se proporciona
  const placeholderDataURL = blurDataURL || generatePlaceholderDataURL(width, height)

  // Si hay error, mostrar placeholder estático
  if (imageError) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-gray-100 text-gray-400",
          className
        )}
        style={{ width, height }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
        </svg>
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Skeleton loader mientras carga */}
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse"
          style={{ width, height }}
        />
      )}
      
      <Image
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={quality}
        sizes={sizes || `(max-width: 768px) ${Math.min(width, 400)}px, ${width}px`}
        placeholder={placeholder}
        blurDataURL={placeholderDataURL}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          objectFit === 'cover' && "object-cover",
          objectFit === 'contain' && "object-contain",
          objectFit === 'fill' && "object-fill",
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true)
          setIsLoading(false)
        }}
        style={{
          objectFit: objectFit
        }}
      />
    </div>
  )
}

// ⚡ Hook para lazy loading de imágenes
export function useOptimizedImage(src: string, width: number, height: number) {
  const [isInView, setIsInView] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  return {
    src: isInView ? getOptimizedSupabaseUrl(src, width, height) : '',
    isInView,
    hasLoaded,
    setIsInView,
    setHasLoaded
  }
}