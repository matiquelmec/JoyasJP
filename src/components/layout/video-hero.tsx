'use client'

import { ArrowDown, Heart, Trophy } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getVideoUrl, getImageUrl } from '@/lib/asset-version'

export function VideoHero() {
  return (
    <section className="relative h-screen w-screen overflow-hidden">
      {/* Background image for immediate LCP - no video */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-black blur-md scale-110 brightness-[0.3]" />
      </div>

      {/* Main video - lazy loaded after LCP */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 2 }}>
        <video
          src={getVideoUrl('mi-video1.mp4')}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          className="w-auto h-full max-w-full object-contain shadow-2xl brightness-[0.85] contrast-[1.1] saturate-[1.1] opacity-0 transition-opacity duration-1000"
          onLoadedData={(e) => {
            (e.target as HTMLVideoElement).style.opacity = '1';
          }}
        />
      </div>

      {/* Professional gradient overlay - focuses attention to center */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-black/60" style={{ zIndex: 1.5 }} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" style={{ zIndex: 1.6 }} />

      {/* Elegant gradient overlay for smooth transition */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/5 to-black/80" style={{ zIndex: 3 }} />
      
      {/* Bottom fade for seamless transition */}
      <div className="absolute bottom-0 left-0 right-0 h-40 sm:h-32 bg-gradient-to-t from-background via-background/90 to-transparent" style={{ zIndex: 4 }} />
      
      {/* Ultra-smooth transition overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-background" style={{ zIndex: 4 }} />

      {/* Content Container */}
      <div className="relative flex flex-col items-center justify-center h-full text-center text-white p-4 pt-24 sm:pt-28 md:pt-36 lg:pt-44" style={{ zIndex: 10 }}>
        {/* Logo with enhanced visibility - optimized loading */}
        <div className="mb-8 relative">
          <Image
            src={getImageUrl('logo.webp')}
            alt="Joyas JP - Alta joyería para la escena urbana"
            width={320}
            height={142}
            priority={true}
            loading="eager"
            fetchPriority="high"
            decoding="sync"
            sizes="(max-width: 768px) 240px, (max-width: 1024px) 320px, 384px"
            className="relative h-auto w-60 md:w-80 lg:w-96 
                       drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] 
                       drop-shadow-[0_8px_32px_rgba(0,0,0,0.6)]
                       brightness-110 contrast-110"
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