'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface BrandLoaderProps {
  isLoading: boolean
  onComplete?: () => void
  showSlogan?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function BrandLoader({ 
  isLoading, 
  onComplete, 
  showSlogan = true,
  size = 'lg',
  className = ''
}: BrandLoaderProps) {
  const [progress, setProgress] = useState(0)
  const [showContent, setShowContent] = useState(true)

  const sizes = {
    sm: { logo: 80, container: 'h-32' },
    md: { logo: 120, container: 'h-48' },
    lg: { logo: 160, container: 'h-screen' }
  }

  useEffect(() => {
    if (isLoading) {
      setProgress(0)
      setShowContent(true)
      
      // Simulate loading progress
      const interval = setInterval(() => {
        setProgress(prev => {
          const increment = Math.random() * 15 + 5 // Random between 5-20
          const newProgress = Math.min(prev + increment, 100)
          
          if (newProgress >= 100) {
            clearInterval(interval)
            setTimeout(() => {
              setShowContent(false)
              onComplete?.()
            }, 500)
          }
          
          return newProgress
        })
      }, 100 + Math.random() * 200) // Random interval for realistic feel

      return () => clearInterval(interval)
    }
  }, [isLoading, onComplete])

  if (!isLoading && !showContent) return null

  return (
    <AnimatePresence mode="wait">
      {showContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className={`
            fixed inset-0 z-50 
            bg-gradient-to-br from-gray-900 via-gray-800 to-black
            flex flex-col items-center justify-center
            ${sizes[size].container}
            ${className}
          `}
        >
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-yellow-600/10" />
            {/* Subtle diamond pattern */}
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 20px 20px, rgba(255,255,255,0.02) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            {/* Animated logo */}
            <motion.div
              initial={{ scale: 0.3, rotateY: -180 }}
              animate={{ 
                scale: 1, 
                rotateY: 0,
                rotateZ: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 1.2, 
                ease: "easeOut",
                rotateZ: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              className="mb-8 relative"
            >
              {/* Glow effect */}
              <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-yellow-400/30 via-yellow-500/20 to-yellow-600/30 blur-lg animate-pulse" />
              
              <div className="relative bg-white/5 backdrop-blur-sm rounded-full p-6 border border-white/10">
                <Image
                  src="/assets/logo.png"
                  alt="Joyas JP"
                  width={sizes[size].logo}
                  height={sizes[size].logo}
                  className="w-auto h-auto drop-shadow-2xl"
                  priority
                />
              </div>
            </motion.div>

            {/* Brand name with typing effect */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-center mb-6"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-wide">
                <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                  Joyas JP
                </span>
              </h1>
              
              {showSlogan && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 1.2 }}
                  className="text-xl md:text-2xl text-gray-300 font-light italic tracking-wider"
                >
                  Atrévete a jugar
                </motion.p>
              )}
            </motion.div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              transition={{ duration: 0.5, delay: 1.5 }}
              className="w-64 md:w-80 mb-4"
            >
              <div className="relative">
                <div className="h-1 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                  <motion.div
                    className="h-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-full relative"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-pulse" />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Loading text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 2 }}
              className="text-gray-400 text-sm tracking-widest uppercase"
            >
              {progress < 30 && "Preparando tu experiencia..."}
              {progress >= 30 && progress < 70 && "Cargando joyas exclusivas..."}
              {progress >= 70 && progress < 100 && "Casi listo para jugar..."}
              {progress >= 100 && "¡Bienvenido!"}
            </motion.div>
          </div>

          {/* Floating particles effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400/30 to-yellow-600/30 rounded-full"
                initial={{ 
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight + 20,
                  scale: 0 
                }}
                animate={{ 
                  y: -20,
                  scale: [0, 1, 0],
                  rotate: 360
                }}
                transition={{ 
                  duration: Math.random() * 6 + 4,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: "linear"
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}