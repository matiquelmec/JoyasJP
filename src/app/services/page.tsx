'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useSiteConfig } from '@/hooks/use-site-config'
import { getVideoUrl } from '@/lib/asset-version'

const servicesPageContent = {
  title: {
    line1: 'Servicios Exclusivos',
    line2: 'para Artistas',
  },
  paragraphs: (storeName: string) => [
    `Tu música y tu imagen merecen brillar con la misma intensidad. En ${storeName}, entendemos que el estilo es una parte fundamental de tu identidad artística. Por eso, ofrecemos un servicio de venta y arriendo de nuestras piezas para tus videoclips, sesiones de fotos y eventos.`,
    'Accede a nuestra colección completa y elige las joyas que definan tu flow y eleven tu producción al siguiente nivel. Contáctanos por WhatsApp o Instagram para contarnos sobre tu proyecto y te prepararemos una propuesta a medida.',
  ],
}

export default function ServicesPage() {
  const { config } = useSiteConfig()
  const storeName = config?.store_name || 'Joyas JP'
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black overflow-x-hidden">
      {/* Hero Section with Video Masks */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background Video Layer */}
        <div className="absolute inset-0 opacity-20">
          <video
            src={getVideoUrl('mi-video2.mp4')}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        {/* Geometric Video Masks */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Large Circle Mask - Top Right */}
          <div 
            className="absolute top-10 right-10 w-80 h-80 rounded-full overflow-hidden opacity-90 transform transition-transform duration-700"
            style={{ transform: `translateY(${scrollY * 0.1}px) scale(${1 + scrollY * 0.0001})` }}
          >
            <video
              src={getVideoUrl('mi-video2.mp4')}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover scale-110 hue-rotate-30"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-transparent mix-blend-overlay" />
          </div>

          {/* Hexagon Mask - Bottom Left */}
          <div 
            className="absolute bottom-20 left-20 w-64 h-64 overflow-hidden opacity-80 transform transition-transform duration-700"
            style={{ 
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              transform: `translateY(${-scrollY * 0.15}px) rotate(${scrollY * 0.05}deg)`
            }}
          >
            <video
              src={getVideoUrl('mi-video2.mp4')}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover scale-125 saturate-150 brightness-110"
            />
            <div className="absolute inset-0 bg-gradient-to-tl from-yellow-500/50 to-transparent mix-blend-overlay" />
          </div>

          {/* Diamond Mask - Center Right */}
          <div 
            className="absolute top-1/2 right-32 w-48 h-48 overflow-hidden opacity-75 transform -translate-y-1/2 transition-transform duration-700"
            style={{ 
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              transform: `translateY(${scrollY * -0.08}px) translateX(${scrollY * 0.05}px) rotate(45deg)`
            }}
          >
            <video
              src={getVideoUrl('mi-video2.mp4')}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover scale-150 contrast-125 hue-rotate-180"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/60 to-transparent mix-blend-overlay" />
          </div>

          {/* Small Circles - Scattered */}
          <div 
            className="absolute top-32 left-1/3 w-32 h-32 rounded-full overflow-hidden opacity-60"
            style={{ transform: `translateY(${scrollY * 0.12}px)` }}
          >
            <video
              src={getVideoUrl('mi-video2.mp4')}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover scale-200 sepia brightness-125"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/70 to-transparent mix-blend-overlay" />
          </div>

          <div 
            className="absolute bottom-32 right-1/4 w-24 h-24 rounded-full overflow-hidden opacity-50"
            style={{ transform: `translateY(${-scrollY * 0.08}px)` }}
          >
            <video
              src={getVideoUrl('mi-video2.mp4')}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover scale-150 invert"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/80 to-transparent mix-blend-overlay" />
          </div>
        </div>

        {/* Main Content with Text Cutouts */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="relative">
            {/* Video Text Background */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                background: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"><text x="50%" y="50%" text-anchor="middle" dy=".35em" font-family="Arial Black" font-size="120" font-weight="bold" fill="white" opacity="0.1">${servicesPageContent.title.line1}</text></svg>')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
            
            <h1 
              className="text-6xl md:text-8xl font-black tracking-tight leading-none mb-8 transform transition-transform duration-700"
              style={{
                background: `linear-gradient(45deg, 
                  transparent 0%, 
                  rgba(255,255,255,0.95) 10%, 
                  rgba(255,255,255,0.95) 90%, 
                  transparent 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 30px rgba(255,255,255,0.3)',
                transform: `translateY(${scrollY * -0.1}px)`
              }}
            >
              {servicesPageContent.title.line1}
              <br />
              <span className="bg-gradient-to-r from-primary via-yellow-500 to-primary bg-clip-text text-transparent animate-pulse">
                {servicesPageContent.title.line2}
              </span>
            </h1>
          </div>

          {/* Glassmorphism Content Cards */}
          <div className="space-y-8 mb-12">
            {servicesPageContent.paragraphs(storeName).map((paragraph, index) => (
              <div
                key={index}
                className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl transform transition-all duration-700 hover:bg-white/15 hover:scale-105"
                style={{
                  transform: `translateY(${scrollY * 0.05 * (index + 1)}px)`,
                  boxShadow: '0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}
              >
                <p className="text-lg md:text-xl text-white/90 leading-relaxed font-medium">
                  {paragraph}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Buttons with Animated Backgrounds */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="https://wa.me/56982990513"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Button
                size="lg"
                className="relative overflow-hidden font-bold text-lg px-8 py-6 bg-gradient-to-r from-green-500 to-green-600 text-white border-2 border-white/30 rounded-full transition-all duration-500 hover:scale-110 hover:shadow-2xl w-64 group-hover:from-green-400 group-hover:to-green-500"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10">Contactar por WhatsApp</span>
              </Button>
            </Link>
            <Link
              href="https://instagram.com/joyasjp"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Button
                size="lg"
                variant="outline"
                className="relative overflow-hidden font-bold text-lg px-8 py-6 bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-white border-2 border-white/50 rounded-full transition-all duration-500 hover:scale-110 hover:shadow-2xl w-64 hover:bg-gradient-to-r hover:from-pink-500/40 hover:to-purple-500/40"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/30 to-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10">Enviar DM a Instagram</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Floating Video Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Floating triangles with video */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-16 h-16 opacity-40 animate-bounce"
              style={{
                left: `${20 + i * 30}%`,
                top: `${30 + i * 20}%`,
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i}s`
              }}
            >
              <video
                src={getVideoUrl('mi-video2.mp4')}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover scale-200 brightness-150"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Scroll Indicator */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce z-20">
        <div className="flex flex-col items-center">
          <span className="text-sm mb-2">Scroll para más</span>
          <div className="w-1 h-8 bg-gradient-to-b from-transparent via-white to-transparent rounded-full" />
        </div>
      </div>
    </div>
  )
}
