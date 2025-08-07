'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface HeroBackgroundOptimizedProps {
  className?: string
  priority?: boolean
}

// ⚡ Detectar calidad de conexión
function useConnectionSpeed() {
  const [connectionSpeed, setConnectionSpeed] = useState<'slow' | 'fast'>('fast')

  useEffect(() => {
    // @ts-ignore - API experimental
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    
    if (connection) {
      const updateConnectionSpeed = () => {
        // Consideramos lenta si es 3G o menos, o si hay data saver activo
        const isSlowConnection = 
          connection.effectiveType === 'slow-2g' ||
          connection.effectiveType === '2g' ||
          connection.effectiveType === '3g' ||
          connection.saveData === true

        setConnectionSpeed(isSlowConnection ? 'slow' : 'fast')
      }

      updateConnectionSpeed()
      connection.addEventListener('change', updateConnectionSpeed)

      return () => connection.removeEventListener('change', updateConnectionSpeed)
    }

    // Fallback: detectar por user agent si es mobile
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    setConnectionSpeed(isMobile ? 'slow' : 'fast')
  }, [])

  return connectionSpeed
}

// ⚡ Detectar si el usuario prefiere menos movimiento
function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches)
    mediaQuery.addEventListener('change', handler)

    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersReduced
}

export function HeroBackgroundOptimized({ 
  className, 
  priority = true 
}: HeroBackgroundOptimizedProps) {
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const connectionSpeed = useConnectionSpeed()
  const prefersReducedMotion = usePrefersReducedMotion()
  
  // ⚡ Solo cargar video si las condiciones son óptimas
  const shouldLoadVideo = connectionSpeed === 'fast' && !prefersReducedMotion && isInView

  // ⚡ Intersection Observer para lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect() // Solo necesitamos detectarlo una vez
          }
        })
      },
      { rootMargin: '100px' } // Comenzar a cargar 100px antes
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // ⚡ Manejar carga del video
  useEffect(() => {
    if (shouldLoadVideo && videoRef.current && !videoLoaded) {
      const video = videoRef.current
      
      const handleCanPlay = () => {
        setVideoLoaded(true)
        video.play().catch(console.error)
      }
      
      const handleError = () => {
        setVideoError(true)
      }

      video.addEventListener('canplay', handleCanPlay)
      video.addEventListener('error', handleError)
      
      // Comenzar la carga
      video.load()

      return () => {
        video.removeEventListener('canplay', handleCanPlay)
        video.removeEventListener('error', handleError)
      }
    }
  }, [shouldLoadVideo, videoLoaded])

  // ⚡ Seleccionar fuente de video basada en conexión
  const getVideoSource = () => {
    if (connectionSpeed === 'slow') {
      return '/assets/mi-video-mobile.mp4' // Versión más liviana
    }
    return '/assets/mi-video-optimized.mp4' // Versión desktop optimizada
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full h-screen overflow-hidden bg-gray-900",
        className
      )}
    >
      {/* ⚡ Imagen de fondo siempre visible */}
      <div className="absolute inset-0">
        <Image
          src="/assets/video-poster-hd.jpg"
          alt="Joyas JP - Colección Premium"
          fill
          priority={priority}
          quality={85}
          sizes="100vw"
          className={cn(
            "object-cover transition-opacity duration-1000",
            videoLoaded && !videoError ? "opacity-30" : "opacity-100"
          )}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        />
      </div>

      {/* ⚡ Video solo si las condiciones son óptimas */}
      {shouldLoadVideo && (
        <video
          ref={videoRef}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
            videoLoaded && !videoError ? "opacity-100" : "opacity-0"
          )}
          autoPlay
          muted
          loop
          playsInline
          preload="none" // No precargar hasta que sea necesario
          poster="/assets/video-poster-hd.jpg"
        >
          <source src={getVideoSource()} type="video/mp4" />
          Tu navegador no soporta el elemento de video.
        </video>
      )}

      {/* ⚡ Overlay para mejorar legibilidad del texto */}
      <div className="absolute inset-0 bg-black bg-opacity-20" />
      
      {/* ⚡ Contenido del hero */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center text-white px-4 max-w-4xl">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 drop-shadow-lg">
            Joyas JP
          </h1>
          <p className="text-xl md:text-2xl mb-8 drop-shadow-md opacity-90">
            Elegancia y distinción en cada pieza
          </p>
          
          {/* ⚡ Botón CTA */}
          <button className="bg-white text-gray-900 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg">
            Explorar Colección
          </button>
        </div>
      </div>

      {/* ⚡ Indicador de carga del video (opcional) */}
      {shouldLoadVideo && !videoLoaded && !videoError && (
        <div className="absolute bottom-4 right-4 text-white text-sm opacity-50">
          Cargando video...
        </div>
      )}

      {/* ⚡ Indicador de conexión lenta */}
      {connectionSpeed === 'slow' && (
        <div className="absolute bottom-4 left-4 text-white text-xs opacity-60">
          Modo de conexión optimizada
        </div>
      )}
    </div>
  )
}

// ⚡ Componente de fallback para server-side rendering
export function HeroBackgroundSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-full h-screen bg-gray-900 animate-pulse", className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-700" />
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center text-white px-4">
          <div className="w-64 h-16 bg-white bg-opacity-20 rounded mb-6 mx-auto" />
          <div className="w-96 h-8 bg-white bg-opacity-10 rounded mb-8 mx-auto" />
          <div className="w-48 h-12 bg-white bg-opacity-20 rounded mx-auto" />
        </div>
      </div>
    </div>
  )
}