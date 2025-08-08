'use client'

import { useState, useEffect } from 'react'

interface LazyVideoProps {
  src: string
  className?: string
  poster?: string
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  playsInline?: boolean
  children?: React.ReactNode
}

export function LazyVideo({
  src,
  className,
  poster,
  autoPlay = false,
  loop = false,
  muted = true,
  playsInline = true,
  children
}: LazyVideoProps) {
  const [shouldLoad, setShouldLoad] = useState(false)
  
  useEffect(() => {
    // Retrasar carga del video para mejorar LCP
    const timer = setTimeout(() => {
      setShouldLoad(true)
    }, 1000) // 1 segundo después del mount
    
    return () => clearTimeout(timer)
  }, [])

  if (!shouldLoad) {
    // Mostrar poster o placeholder mientras el video no carga
    return (
      <div 
        className={className}
        style={{
          backgroundImage: poster ? `url(${poster})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#1a1a1a'
        }}
      >
        {children}
      </div>
    )
  }

  return (
    <video
      className={className}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      playsInline={playsInline}
      poster={poster}
    >
      <source src={src} type="video/mp4" />
      {children}
    </video>
  )
}