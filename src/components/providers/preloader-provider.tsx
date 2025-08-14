'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Preloader } from '@/components/ui/preloader'

interface PreloaderContextType {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const PreloaderContext = createContext<PreloaderContextType>({
  isLoading: true,
  setIsLoading: () => {},
})

export function usePreloader() {
  return useContext(PreloaderContext)
}

export function PreloaderProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [showPreloader, setShowPreloader] = useState(true)

  useEffect(() => {
    // Solo mostrar el preloader en la carga inicial
    const hasSeenPreloader = sessionStorage.getItem('hasSeenPreloader')
    
    if (hasSeenPreloader) {
      setShowPreloader(false)
      setIsLoading(false)
    } else {
      // Marcar que ya se vio el preloader en esta sesión
      sessionStorage.setItem('hasSeenPreloader', 'true')
      
      // Ocultar después de 3.5 segundos (3s de animación + 0.5s de fade out)
      const timer = setTimeout(() => {
        setIsLoading(false)
        setShowPreloader(false)
      }, 3500)

      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <PreloaderContext.Provider value={{ isLoading, setIsLoading }}>
      {showPreloader && <Preloader />}
      <div className={showPreloader ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}>
        {children}
      </div>
    </PreloaderContext.Provider>
  )
}