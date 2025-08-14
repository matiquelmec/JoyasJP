'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

export function Preloader() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Duración exacta de 3 segundos
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)

    // Precargar recursos críticos
    const preloadResources = async () => {
      const logoImg = new window.Image()
      logoImg.src = '/assets/logo.webp'
      
      const video = document.createElement('video')
      video.src = '/assets/mi-video.mp4'
      video.load()
    }

    preloadResources()

    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
        >
          {/* Fondo negro puro */}
          <div className="absolute inset-0 bg-black" />
          
          {/* Efecto de iluminación sutil detrás del logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-96 h-96 bg-red-600/10 rounded-full filter blur-[150px]"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>

          {/* Contenedor principal */}
          <div className="relative flex flex-col items-center justify-center">
            {/* Logo iluminado */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
              }}
              transition={{ 
                duration: 0.8, 
                ease: 'easeOut',
              }}
              className="relative"
            >
              <Image
                src="/assets/logo.webp"
                alt="Joyas JP"
                width={320}
                height={320}
                priority
                className="w-56 md:w-72 lg:w-80 h-auto"
                style={{
                  filter: 'drop-shadow(0 0 40px rgba(239, 68, 68, 0.5)) drop-shadow(0 0 80px rgba(239, 68, 68, 0.3))',
                }}
              />
              
              {/* Efecto de pulso en el logo */}
              <motion.div
                className="absolute inset-0"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>

            {/* Texto "Listo para jugar" */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mt-12 text-white/80 text-lg md:text-xl font-light tracking-[0.3em] uppercase"
              style={{
                textShadow: '0 0 20px rgba(239, 68, 68, 0.5)',
              }}
            >
              Listo para jugar
            </motion.p>

            {/* Puntos de carga animados */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-8 flex gap-2"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-red-500 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}