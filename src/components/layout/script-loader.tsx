'use client'

import { useEffect } from 'react'

export function DeferredScripts() {
  useEffect(() => {
    // Defer loading of non-critical scripts after initial render
    const timer = setTimeout(() => {
      // Load analytics or other non-critical scripts here
      console.log('Deferred scripts loaded')
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])

  return null
}