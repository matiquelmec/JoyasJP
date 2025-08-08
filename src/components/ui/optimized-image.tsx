'use client'

import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { getBlurDataURL } from '@/lib/image-optimization'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
  quality?: number
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  className,
  priority = false,
  fill = false,
  width,
  height,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  quality = 85,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isInView, setIsInView] = useState(priority)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px', // Precargar 50px antes
        threshold: 0.01,
      }
    )

    observer.observe(imgRef.current)

    return () => observer.disconnect()
  }, [priority])

  const handleLoad = () => {
    setHasLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    setHasLoaded(true)
    onError?.()
  }

  return (
    <div ref={imgRef} className={cn('relative overflow-hidden', className)}>
      {/* Blur placeholder mientras carga */}
      {!hasLoaded && (
        <div 
          className="absolute inset-0 animate-pulse"
          style={{
            backgroundImage: `url(${getBlurDataURL()})`,
            backgroundSize: 'cover',
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
          }}
        />
      )}

      {/* Imagen real - solo se carga cuando está en viewport */}
      {isInView && !hasError && (
        fill ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            quality={quality}
            className={cn(
              'transition-all duration-700',
              hasLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm',
              className
            )}
            onLoad={handleLoad}
            onError={handleError}
            priority={priority}
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={width || 400}
            height={height || 400}
            sizes={sizes}
            quality={quality}
            className={cn(
              'transition-all duration-700',
              hasLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm',
              className
            )}
            onLoad={handleLoad}
            onError={handleError}
            priority={priority}
          />
        )
      )}

      {/* Fallback si hay error */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800">
          <div className="text-center p-4">
            <svg
              className="w-12 h-12 mx-auto mb-2 text-zinc-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-xs text-zinc-500">Imagen no disponible</p>
          </div>
        </div>
      )}
    </div>
  )
}