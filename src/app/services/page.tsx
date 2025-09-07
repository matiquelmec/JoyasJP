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
    <div className="flex flex-col">
      {/* Full-Screen Video Hero Section */}
      <section className="fixed top-0 left-0 w-full h-screen overflow-hidden z-0">
        <video
          src={getVideoUrl('mi-video2.mp4')}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute top-0 left-0 w-full h-full object-cover"
          aria-label="Video promocional de servicios para artistas"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-black/40" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Glassmorphism Title Card */}
            <div 
              className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 mb-8 shadow-2xl animate-fadeInScale"
              style={{
                boxShadow: '0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                transform: `translateY(${scrollY * -0.1}px)`
              }}
            >
              <h1 className="text-5xl md:text-6xl font-headline font-bold leading-tight">
                {servicesPageContent.title.line1}
                <br />
                <span className="text-primary drop-shadow-lg">
                  {servicesPageContent.title.line2}
                </span>
              </h1>
            </div>

            {/* Glassmorphism Content Cards */}
            <div className="space-y-6 mb-12">
              {servicesPageContent.paragraphs(storeName).map((paragraph, index) => (
                <div
                  key={index}
                  className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 shadow-xl animate-fadeInUp-delayed-02 hover:bg-white/15 transition-all duration-300"
                  style={{
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                    transform: `translateY(${scrollY * 0.05 * (index + 1)}px)`,
                    animationDelay: `${index * 0.2}s`
                  }}
                >
                  <p className="text-lg text-white/90 leading-relaxed">
                    {paragraph}
                  </p>
                </div>
              ))}
            </div>

            {/* Floating CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto animate-fadeInUp-delayed-04">
              <Link
                href="https://wa.me/56982990513"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button
                  size="lg"
                  className="w-full font-bold text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20 shadow-2xl"
                >
                  Contactar por WhatsApp
                </Button>
              </Link>
              <Link
                href="https://instagram.com/joyasjp"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full font-bold text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-black transition-all duration-300 hover:scale-105 backdrop-blur-sm shadow-2xl"
                >
                  Enviar DM a Instagram
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Spacer for fixed video */}
      <div className="h-screen"></div>

      {/* Additional Content Section (Scroll Reveal) */}
      <section 
        className="py-20 md:py-28 bg-background relative z-10"
        style={{
          opacity: scrollY > 100 ? 1 : 0,
          transform: `translateY(${scrollY > 100 ? 0 : 50}px)`,
          transition: 'all 0.6s ease-out'
        }}
      >
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-8">
              ¿Cómo Funciona?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center p-6 rounded-xl bg-card/50 border border-border/50 hover:bg-card/70 transition-all duration-300">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Contáctanos</h3>
                <p className="text-muted-foreground">
                  Cuéntanos sobre tu proyecto, fechas y estilo que buscas
                </p>
              </div>

              <div className="text-center p-6 rounded-xl bg-card/50 border border-border/50 hover:bg-card/70 transition-all duration-300">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Seleccionamos</h3>
                <p className="text-muted-foreground">
                  Preparamos una selección personalizada de piezas para ti
                </p>
              </div>

              <div className="text-center p-6 rounded-xl bg-card/50 border border-border/50 hover:bg-card/70 transition-all duration-300">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Brillás</h3>
                <p className="text-muted-foreground">
                  Recibe las joyas y crea contenido que impacte
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
