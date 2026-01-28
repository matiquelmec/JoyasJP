'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { getSafeUrl } from '@/lib/safe-asset'

export function Preloader() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Solo 3 segundos para homepage
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)

    // Preload de video optimizado via Link tag (para no bloquear)
    if (typeof window !== 'undefined') {
      const videoUrl = getSafeUrl('mi-video.mp4')
      // Check if link already exists
      if (!document.querySelector(`link[href="${videoUrl}"]`)) {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'video'
        link.href = videoUrl
        document.head.appendChild(link)
      }
    }

    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            filter: 'blur(5px)',
          }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
        >
          {/* Contenedor principal */}
          <motion.div
            className="relative flex flex-col items-center justify-center text-center px-4"
          >
            {/* Logo con respiración elegante */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: 1,
                scale: [0.9, 1, 0.98, 1],
              }}
              transition={{
                opacity: { duration: 0.8, ease: 'easeOut' },
                scale: {
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                },
              }}
              className="relative mb-8"
            >
              <Image
                src={getSafeUrl('logo.webp')}
                alt="Joyas JP"
                width={320}
                height={320}
                priority
                className="w-48 md:w-60 lg:w-72 h-auto"
                style={{
                  filter: `
                    drop-shadow(0 0 20px rgba(255,255,255,0.3))
                    drop-shadow(0 0 40px rgba(255,255,255,0.1))
                    brightness(1.05)
                  `,
                }}
              />
            </motion.div>

            {/* Texto que se escribe letra por letra */}
            <motion.div className="relative">
              <motion.p
                className="text-white text-xl md:text-2xl font-light tracking-[0.3em] uppercase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                {"Atrévete a jugar".split("").map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: 0.03,
                      delay: 1.2 + index * 0.08,
                      ease: "easeOut"
                    }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </motion.p>

            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}