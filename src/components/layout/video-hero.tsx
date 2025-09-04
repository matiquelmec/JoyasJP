'use client'

import { Heart, Sparkles, Trophy } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getVideoUrl, getImageUrl } from '@/lib/asset-version'

export function VideoHero() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <video
        src={getVideoUrl('video-1.mp4')}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        aria-label="Video promocional de Joyas JP"
      />
      <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-10" />

      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center text-white p-4">
        <Image
          src={getImageUrl('logo.webp')}
          alt="Joyas JP - Alta joyería para la escena urbana"
          width={500}
          height={500}
          priority
          className="h-auto w-80 md:w-96 lg:w-[450px] mb-6 drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)]"
        />

        <p className="mt-4 max-w-2xl text-lg md:text-xl text-white/90 mb-8">
          <span className="inline-flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Atrévete a brillar con estilo único
          </span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 max-w-md w-full">
          <Link href="/shop" className="flex-1">
            <Button
              size="lg"
              className="w-full font-bold text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:scale-105"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Ver Colección
            </Button>
          </Link>
          <Link href="/services" className="flex-1">
            <Button
              size="lg"
              variant="outline"
              className="w-full font-bold text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-black transition-all duration-300 hover:scale-105"
            >
              <Heart className="w-5 h-5 mr-2" />
              Servicios
            </Button>
          </Link>
        </div>
      </div>

    </section>
  )
}