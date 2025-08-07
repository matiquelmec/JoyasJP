'use client'

import { useState, useEffect } from 'react'
import { ArrowDown, Heart, Trophy } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

export function VideoHero() {
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [showLogo, setShowLogo] = useState(false)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Secuencia de carga: Video → Logo → Contenido
    let logoTimer: NodeJS.Timeout
    let contentTimer: NodeJS.Timeout

    if (videoLoaded) {
      // Mostrar logo 500ms después de que carga el video
      logoTimer = setTimeout(() => {
        setShowLogo(true)
        // Mostrar contenido 800ms después del logo
        contentTimer = setTimeout(() => {
          setShowContent(true)
        }, 800)
      }, 500)
    }

    return () => {
      clearTimeout(logoTimer)
      clearTimeout(contentTimer)
    }
  }, [videoLoaded])

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          crossOrigin="anonymous"
          className="w-full h-full object-cover object-center min-w-full min-h-full"
          onLoadedData={() => setVideoLoaded(true)}
          onCanPlay={() => setVideoLoaded(true)}
          onError={(e) => {
            console.warn('Video error:', e)
            setVideoLoaded(true) // Show content even if video fails
          }}
          poster="/assets/video-poster.jpg"
          style={{ 
            willChange: 'transform',
            objectFit: 'cover',
            objectPosition: 'center center',
            width: '100vw',
            height: '100vh'
          }}
        >
          <source src="/assets/mi-video1.mp4" type="video/mp4" />
          {/* Fallback para navegadores sin soporte de video */}
          <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
        </video>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 z-10" />

      {/* Loading Spinner (mientras carga el video) */}
      {!videoLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center z-20">
          <div className="flex flex-col items-center text-white">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-white/70">Cargando experiencia...</p>
          </div>
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center text-white p-4 pt-40 md:pt-44">
        
        {/* Logo con animación de entrada */}
        <AnimatePresence>
          {showLogo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 1.2, 
                ease: "easeOut",
                type: "spring",
                stiffness: 100
              }}
              className="mb-8"
            >
              <img
                src="/assets/logo.png"
                alt="Joyas JP - Alta joyería para la escena urbana"
                className="h-auto w-80 md:w-96 lg:w-[450px] drop-shadow-[0_4px_20px_rgba(255,255,255,0.3)]"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slogan y botones con animación secuencial */}
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              <p className="max-w-2xl text-lg md:text-xl text-white/90 font-light italic tracking-wide">
                Atrévete a jugar
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 max-w-md w-full"
              >
                <Link href="/shop" className="flex-1">
                  <Button
                    size="lg"
                    className="w-full font-bold text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                  >
                    <Trophy className="w-5 h-5 mr-2" />
                    Productos
                  </Button>
                </Link>
                <Link href="/services" className="flex-1">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full font-bold text-lg px-8 py-6 border-white/80 text-white hover:bg-white/10 hover:border-white transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Servicio para artistas
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll indicator */}
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
              >
                <ArrowDown className="w-8 h-8 text-white/70" />
                <span className="sr-only">Desplázate para ver más</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}