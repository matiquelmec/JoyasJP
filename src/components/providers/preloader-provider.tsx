'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
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
  const pathname = usePathname()

  useEffect(() => {
    // Mostrar preloader cada vez que cambia la ruta
    setShowPreloader(true)
    setIsLoading(true)
    
    // Ocultar después de 3.6 segundos (3s de animación + 0.6s de fade out)
    const timer = setTimeout(() => {
      setIsLoading(false)
      setShowPreloader(false)
    }, 3600)

    return () => clearTimeout(timer)
  }, [pathname]) // Se ejecuta cada vez que cambia la ruta

  return (
    <PreloaderContext.Provider value={{ isLoading, setIsLoading }}>
      {showPreloader && <Preloader />}
      <div className={showPreloader ? 'opacity-0' : 'opacity-100 transition-opacity duration-700'}>
        {children}
      </div>
    </PreloaderContext.Provider>
  )
}