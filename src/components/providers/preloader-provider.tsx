'use client'

import { createContext, useContext, useState } from 'react'

interface PreloaderContextType {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const PreloaderContext = createContext<PreloaderContextType>({
  isLoading: false,
  setIsLoading: () => {},
})

export function usePreloader() {
  return useContext(PreloaderContext)
}

export function PreloaderProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <PreloaderContext.Provider value={{ isLoading, setIsLoading }}>
      <div className="opacity-100 transition-opacity duration-300">{children}</div>
    </PreloaderContext.Provider>
  )
}
