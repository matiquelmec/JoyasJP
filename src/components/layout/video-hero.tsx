'use client'

import { ArrowDown, Heart, Trophy } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getVideoUrl, getImageUrl } from '@/lib/asset-version'

export function VideoHero() {
  return (
    <section className="relative h-screen w-screen overflow-hidden">
      {/* Blurred Background Video - More visible effect */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-150 blur-xl opacity-80 brightness-75"
        >
          <source src={getVideoUrl('mi-video1.mp4')} type="video/mp4" />
        </video>
      </div>

      {/* Main Video - Centered and Sharp */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 2 }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-auto h-full max-w-full object-contain shadow-2xl"
        >
          <source src={getVideoUrl('mi-video1.mp4')} type="video/mp4" />
        </video>
      </div>

      {/* Elegant gradient overlay for smooth transition */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/5 to-black/80" style={{ zIndex: 3 }} />
      
      {/* Bottom fade for seamless transition */}
      <div className="absolute bottom-0 left-0 right-0 h-40 sm:h-32 bg-gradient-to-t from-background via-background/90 to-transparent" style={{ zIndex: 4 }} />
      
      {/* Ultra-smooth transition overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-background" style={{ zIndex: 4 }} />

      {/* Content Container */}
      <div className="relative flex flex-col items-center justify-center h-full text-center text-white p-4 pt-24 sm:pt-28 md:pt-36 lg:pt-44" style={{ zIndex: 10 }}>
        {/* Logo */}
        <div className="mb-8">
          <img
            src={getImageUrl('logo.png')}
            alt="Joyas JP - Alta joyería para la escena urbana"
            className="h-auto w-80 md:w-96 lg:w-[450px] drop-shadow-[0_4px_20px_rgba(255,255,255,0.3)]"
          />
        </div>

        {/* Slogan */}
        <p className="max-w-2xl text-lg md:text-xl text-white/90 font-light italic tracking-wide mb-8">
          Atrévete a jugar
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 max-w-md w-full mb-16">
          <Link href="/shop" className="flex-1">
            <Button
              size="lg"
              className="w-full font-bold text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:scale-105"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Productos
            </Button>
          </Link>
          <Link href="/services" className="flex-1">
            <Button
              size="lg"
              variant="outline"
              className="w-full font-bold text-lg px-8 py-6 border-white/80 text-white hover:bg-white/20 hover:border-white transition-all duration-300 hover:scale-105"
            >
              <Heart className="w-5 h-5 mr-2" />
              Servicio para artistas
            </Button>
          </Link>
        </div>

        {/* Scroll indicator - Above the fade */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 animate-bounce" style={{ zIndex: 5 }}>
          <ArrowDown className="w-8 h-8 text-white/90 drop-shadow-md" />
          <span className="sr-only">Desplázate para ver más</span>
        </div>
      </div>
    </section>
  )
}