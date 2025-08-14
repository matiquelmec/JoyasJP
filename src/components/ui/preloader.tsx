'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

export function Preloader() {
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Simular progreso de carga suave durante 3 segundos
    const duration = 3000 // 3 segundos exactos
    const interval = 30 // Actualizar cada 30ms para suavidad
    const increment = 100 / (duration / interval)

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment
        if (next >= 100) {
          clearInterval(timer)
          // Pequeño delay antes de ocultar para asegurar que llegue a 100%
          setTimeout(() => setIsLoading(false), 200)
          return 100
        }
        return next
      })
    }, interval)

    // Precargar recursos críticos mientras se muestra el loader
    const preloadResources = async () => {
      // Precargar logo
      const logoImg = new window.Image()
      logoImg.src = '/assets/logo.webp'
      
      // Precargar video (metadata)
      const video = document.createElement('video')
      video.src = '/assets/mi-video1.mp4'
      video.load()
    }

    preloadResources()

    return () => clearInterval(timer)
  }, [])

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
        >
          {/* Fondo con gradiente sutil */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black" />
          
          {/* Efecto de partículas sutiles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-20">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-900/20 rounded-full filter blur-[100px] animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-800/20 rounded-full filter blur-[100px] animate-pulse delay-700" />
            </div>
          </div>

          {/* Contenedor principal */}
          <div className="relative flex flex-col items-center justify-center">
            {/* Logo con animación */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="relative mb-12"
            >
              <Image
                src="/assets/logo.webp"
                alt="Joyas JP"
                width={280}
                height={280}
                priority
                className="w-48 md:w-64 lg:w-72 h-auto drop-shadow-[0_0_30px_rgba(239,68,68,0.3)]"
              />
              
              {/* Efecto de brillo animado alrededor del logo */}
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(239,68,68,0.2)',
                    '0 0 40px rgba(239,68,68,0.4)',
                    '0 0 20px rgba(239,68,68,0.2)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>

            {/* Barra de progreso minimalista */}
            <div className="w-64 md:w-80 lg:w-96">
              {/* Contenedor de la barra */}
              <div className="relative h-[2px] bg-white/10 rounded-full overflow-hidden">
                {/* Progreso */}
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1, ease: 'linear' }}
                  style={{
                    boxShadow: '0 0 10px rgba(239,68,68,0.5)',
                  }}
                />
                
                {/* Efecto de brillo en la punta */}
                <motion.div
                  className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{
                    left: `${progress - 4}%`,
                  }}
                  transition={{ duration: 0.1, ease: 'linear' }}
                />
              </div>

              {/* Texto de progreso */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-center"
              >
                <p className="text-white/60 text-sm font-light tracking-[0.3em] uppercase">
                  Cargando
                </p>
                <p className="text-white/40 text-xs mt-2 tracking-widest">
                  {Math.round(progress)}%
                </p>
              </motion.div>
            </div>

            {/* Texto inspiracional que aparece gradualmente */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 1 }}
              className="absolute bottom-12 text-white/30 text-xs tracking-[0.3em] uppercase"
            >
              Alta Joyería Urbana
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}