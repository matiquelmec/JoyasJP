'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Pequeño delay para permitir que el contenido se renderice
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={cn(
        'transition-opacity duration-700 ease-out',
        isLoaded ? 'opacity-100' : 'opacity-0'
      )}
    >
      {children}
    </div>
  )
}