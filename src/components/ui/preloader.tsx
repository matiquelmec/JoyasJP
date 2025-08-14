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
      const preloadResources = () => {
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

  // Efecto magnetismo del mouse
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
            scale: 1.05,
            filter: 'blur(10px)',
          }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden cursor-none"
        >
          {/* Fondo con gradiente sutil */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-950 to-black" />
          
          {/* Campo gravitacional que sigue el mouse */}
          <motion.div
            className="absolute w-96 h-96 rounded-full pointer-events-none"
            animate={{
              x: mousePosition.x * 200,
              y: mousePosition.y * 200,
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 150 }}
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 40%, transparent 70%)',
              filter: 'blur(20px)',
            }}
          />

          {/* Partículas magnéticas que siguen el cursor */}
          <div className="absolute inset-0">
            {[...Array(15)].map((_, i) => {
              const baseX = (i % 5) * (typeof window !== 'undefined' ? window.innerWidth / 5 : 400)
              const baseY = Math.floor(i / 5) * (typeof window !== 'undefined' ? window.innerHeight / 3 : 300)
              
              return (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-white/60 rounded-full"
                  initial={{
                    x: baseX,
                    y: baseY,
                  }}
                  animate={{
                    x: baseX + (mousePosition.x * 80 * (1 - i * 0.05)),
                    y: baseY + (mousePosition.y * 80 * (1 - i * 0.05)),
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 0.9, 0.6],
                  }}
                  transition={{
                    x: { type: 'spring', damping: 20 + i * 2, stiffness: 100 },
                    y: { type: 'spring', damping: 20 + i * 2, stiffness: 100 },
                    scale: { duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut' },
                    opacity: { duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  style={{
                    filter: 'blur(0.5px)',
                    boxShadow: '0 0 8px rgba(255,255,255,0.4)',
                  }}
                />
              )
            })}
          </div>

          {/* Ondas gravitacionales desde el cursor */}
          <motion.div
            className="absolute pointer-events-none"
            animate={{
              x: mousePosition.x * 300,
              y: mousePosition.y * 300,
            }}
            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute border border-white/15 rounded-full"
                animate={{
                  scale: [0, 3, 6],
                  opacity: [0.5, 0.2, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: 'easeOut',
                }}
                style={{
                  width: '100px',
                  height: '100px',
                  left: '-50px',
                  top: '-50px',
                }}
              />
            ))}
          </motion.div>

          {/* Contenedor principal con atracción magnética */}
          <motion.div 
            className="relative flex flex-col items-center justify-center"
            animate={{
              rotateY: mousePosition.x * 15,
              rotateX: -mousePosition.y * 10,
              x: mousePosition.x * 30,
              y: mousePosition.y * 20,
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Logo con inclinación magnética */}
            <motion.div
              className="relative"
              animate={{
                scale: [1, 1.02, 1],
                rotateZ: mousePosition.x * 5,
              }}
              transition={{
                scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                rotateZ: { type: 'spring', damping: 30, stiffness: 200 },
              }}
            >
              {/* Aura magnética que se intensifica con el mouse */}
              <motion.div
                className="absolute inset-0 bg-white rounded-full"
                animate={{
                  scale: [1, 1.3 + Math.abs(mousePosition.x) * 0.2, 1],
                  opacity: [0, 0.2 + Math.abs(mousePosition.x) * 0.1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  filter: 'blur(30px)',
                }}
              />

              {/* Anillos orbitales que se distorsionan con el mouse */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ 
                  rotate: 360,
                  scale: 1 + Math.abs(mousePosition.x) * 0.1,
                }}
                transition={{ 
                  rotate: { duration: 15, repeat: Infinity, ease: 'linear' },
                  scale: { type: 'spring', damping: 25, stiffness: 200 },
                }}
              >
                <motion.div 
                  className="absolute w-72 h-72 border border-white/20 rounded-full"
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.2, 0.3 + Math.abs(mousePosition.y) * 0.2, 0.2],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{
                    boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
                    transform: `skewX(${mousePosition.x * 5}deg)`,
                  }} 
                />
                <motion.div 
                  className="absolute w-80 h-80 border border-white/15 rounded-full"
                  animate={{
                    scale: [1, 1.03, 1],
                    opacity: [0.15, 0.25, 0.15],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{
                    boxShadow: '0 0 15px rgba(255, 255, 255, 0.2)',
                    transform: `skewY(${mousePosition.y * 3}deg)`,
                  }} 
                />
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
                    drop-shadow(0 0 30px rgba(255,255,255,${0.3 + Math.abs(mousePosition.x) * 0.2}))
                    drop-shadow(0 0 60px rgba(255,255,255,${0.2 + Math.abs(mousePosition.y) * 0.1}))
                    brightness(${1.1 + Math.abs(mousePosition.x) * 0.1})
                    contrast(1.1)
                  `,
                }}
              />

              {/* Destello reactivo al mouse */}
              <motion.div
                className="absolute inset-0 bg-white"
                animate={{
                  opacity: [0, Math.abs(mousePosition.x) * 0.3 + Math.abs(mousePosition.y) * 0.2, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 60%)',
                  mixBlendMode: 'screen',
                }}
              />
            </motion.div>

            {/* Texto que se inclina con el mouse */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                rotateX: mousePosition.y * 10,
              }}
              transition={{ 
                opacity: { delay: 1, duration: 0.8 },
                y: { delay: 1, duration: 0.8 },
                rotateX: { type: 'spring', damping: 25, stiffness: 200 },
              }}
              className="mt-12 relative"
            >
              <motion.p
                className="text-white/90 text-lg md:text-xl font-light tracking-[0.4em] uppercase"
                animate={{
                  opacity: [0.9, 1, 0.9],
                  textShadow: [
                    '0 0 10px rgba(255,255,255,0.3)',
                    `0 0 15px rgba(255,255,255,${0.4 + Math.abs(mousePosition.x) * 0.2})`,
                    '0 0 10px rgba(255,255,255,0.3)',
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
            </motion.div>

            {/* Indicadores que siguen el mouse */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-8 flex items-center gap-3"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-white/70 rounded-full"
                  animate={{
                    scale: [1, 1.3 + Math.abs(mousePosition.x) * 0.3, 1],
                    opacity: [0.7, 1, 0.7],
                    x: mousePosition.x * (5 + i * 2),
                    y: mousePosition.y * (3 + i),
                  }}
                  transition={{
                    scale: { duration: 1.5, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' },
                    opacity: { duration: 1.5, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' },
                    x: { type: 'spring', damping: 20, stiffness: 150 },
                    y: { type: 'spring', damping: 20, stiffness: 150 },
                  }}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Cursor magnético personalizado */}
          <motion.div
            className="absolute w-8 h-8 border-2 border-white/60 rounded-full pointer-events-none"
            animate={{
              x: mousePosition.x * (typeof window !== 'undefined' ? window.innerWidth / 2 : 400),
              y: mousePosition.y * (typeof window !== 'undefined' ? window.innerHeight / 2 : 300),
              scale: [1, 1.2, 1],
            }}
              transition={{ 
                x: { type: 'spring', damping: 25, stiffness: 200 },
                y: { type: 'spring', damping: 25, stiffness: 200 },
                scale: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
              }}
            style={{
              boxShadow: '0 0 15px rgba(255,255,255,0.5)',
              background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}