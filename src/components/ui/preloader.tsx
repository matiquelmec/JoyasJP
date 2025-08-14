'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

export function Preloader() {
  const [isLoading, setIsLoading] = useState(true)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Duración exacta de 3 segundos
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)

    // Precargar recursos críticos
    if (typeof window !== 'undefined') {
      const preloadResources = async () => {
        const logoImg = new window.Image()
        logoImg.src = '/assets/logo.webp'
        
        const video = document.createElement('video')
        video.src = '/assets/mi-video.mp4'
        video.load()
      }

      preloadResources()
    }

    return () => clearTimeout(timer)
  }, [])

  // Efecto de seguimiento del mouse para interactividad
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setMousePosition({
          x: (e.clientX - rect.left - rect.width / 2) / rect.width,
          y: (e.clientY - rect.top - rect.height / 2) / rect.height,
        })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.1,
            filter: 'blur(10px)',
          }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden cursor-none"
        >
          {/* Fondo con gradiente dinámico */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-950 to-black" />
          
          {/* Grid futurista de fondo */}
          <div className="absolute inset-0 opacity-10">
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
                transform: `perspective(800px) rotateX(60deg) translateZ(0)`,
                transformOrigin: 'center center',
              }}
            />
          </div>

          {/* Partículas flotantes interactivas */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/20 rounded-full"
                initial={{
                  x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 1920,
                  y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : Math.random() * 1080,
                }}
                animate={{
                  x: [
                    typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 1920,
                    typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 1920,
                    typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 1920,
                  ],
                  y: [
                    typeof window !== 'undefined' ? Math.random() * window.innerHeight : Math.random() * 1080,
                    typeof window !== 'undefined' ? Math.random() * window.innerHeight : Math.random() * 1080,
                    typeof window !== 'undefined' ? Math.random() * window.innerHeight : Math.random() * 1080,
                  ],
                }}
                transition={{
                  duration: 10 + Math.random() * 10,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{
                  filter: 'blur(0.5px)',
                  boxShadow: '0 0 4px rgba(255,255,255,0.5)',
                }}
              />
            ))}
          </div>

          {/* Efecto de luz que sigue el mouse */}
          <motion.div
            className="absolute w-96 h-96 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              filter: 'blur(40px)',
              x: mousePosition.x * 100,
              y: mousePosition.y * 100,
            }}
            animate={{
              x: mousePosition.x * 100,
              y: mousePosition.y * 100,
            }}
            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
          />

          {/* Contenedor principal con efecto 3D */}
          <motion.div 
            className="relative flex flex-col items-center justify-center"
            style={{
              transform: `perspective(1000px) rotateY(${mousePosition.x * 10}deg) rotateX(${-mousePosition.y * 10}deg)`,
            }}
          >
            {/* Logo con efecto holográfico */}
            <motion.div
              initial={{ 
                scale: 0,
                rotateY: 180,
                opacity: 0,
              }}
              animate={{ 
                scale: 1,
                rotateY: 0,
                opacity: 1,
              }}
              transition={{ 
                duration: 1.2,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              className="relative"
            >
              {/* Efecto de anillos orbitales */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              >
                <div className="absolute w-72 h-72 border border-white/10 rounded-full" />
                <div className="absolute w-80 h-80 border border-white/5 rounded-full" />
                <div className="absolute w-96 h-96 border border-white/[0.02] rounded-full" />
              </motion.div>

              <Image
                src="/assets/logo.webp"
                alt="Joyas JP"
                width={320}
                height={320}
                priority
                className="w-56 md:w-72 lg:w-80 h-auto relative z-10"
                style={{
                  filter: `
                    drop-shadow(0 0 30px rgba(255,255,255,0.4))
                    drop-shadow(0 0 60px rgba(255,255,255,0.2))
                    drop-shadow(0 0 120px rgba(255,255,255,0.1))
                    brightness(1.2)
                    contrast(1.1)
                  `,
                }}
              />
              
              {/* Efecto de escaneo vertical */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent"
                animate={{
                  y: ['-100%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{ mixBlendMode: 'overlay' }}
              />
            </motion.div>

            {/* Texto con efecto de glitch */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-12 relative"
            >
              <motion.p
                className="text-white/90 text-lg md:text-xl font-light tracking-[0.4em] uppercase"
                animate={{
                  textShadow: [
                    '0 0 10px rgba(255,255,255,0.5)',
                    '0 0 20px rgba(255,255,255,0.8), -2px 0 0 rgba(0,255,255,0.5), 2px 0 0 rgba(255,0,255,0.5)',
                    '0 0 10px rgba(255,255,255,0.5)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                ¿Listo para jugar?
              </motion.p>
              
              {/* Efecto de glitch ocasional */}
              <motion.p
                className="absolute inset-0 text-white/90 text-lg md:text-xl font-light tracking-[0.4em] uppercase"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0, 0, 1, 0],
                  x: [0, -2, 2, -1, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  times: [0, 0.7, 0.8, 0.9, 1],
                }}
                style={{
                  color: 'cyan',
                  mixBlendMode: 'screen',
                }}
              >
                ¿Listo para jugar?
              </motion.p>
            </motion.div>

            {/* Indicador de carga futurista */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-8 flex items-center gap-4"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="relative"
                >
                  <motion.div
                    className="w-3 h-3 bg-white/80 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: 'easeInOut',
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 w-3 h-3 bg-white rounded-full"
                    animate={{
                      scale: [1, 2, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: 'easeInOut',
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Cursor personalizado */}
          {typeof window !== 'undefined' && (
            <motion.div
              className="absolute w-6 h-6 border-2 border-white/50 rounded-full pointer-events-none mix-blend-difference"
              animate={{
                x: mousePosition.x * window.innerWidth / 2,
                y: mousePosition.y * window.innerHeight / 2,
              }}
              transition={{ type: 'spring', damping: 30, stiffness: 200 }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}