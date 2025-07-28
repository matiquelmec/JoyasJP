"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowDown, Trophy, Heart } from 'lucide-react';
import { useDeviceType } from '@/hooks/use-mobile';

export function HeroSection() {
  const { deviceType, connectionType, isClient } = useDeviceType();

  // Mostrar video por defecto para evitar flash, luego optimizar
  const shouldShowVideo = !isClient || (deviceType !== 'mobile' && connectionType === 'fast');

  return (
    <section className="relative h-[calc(100vh+9rem)] w-full overflow-hidden mt-[-9rem]">
      {/* Siempre mostrar video primero para evitar flash, optimización se aplica después */}
      <video
        src="/assets/mi-video.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        aria-label="Video promocional de Joyas JP"
        style={{ 
          display: shouldShowVideo ? 'block' : 'none'
        }}
      />
      
      {/* Imagen de respaldo solo en móvil */}
      {isClient && deviceType === 'mobile' && (
        <Image
          src="/assets/hero-poster.webp"
          alt="Joyas JP - Atrévete a jugar con joyas urbanas premium"
          fill
          priority
          quality={75}
          sizes="100vw"
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        />
      )}
      
      <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10" />
      
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center text-white p-4">
        {/* Logo central simplificado para garantizar carga */}
        <div className="relative w-80 h-80 md:w-96 md:h-96 lg:w-[450px] lg:h-[450px] mb-6">
          <Image
            src="/assets/logo.webp"
            alt="Joyas JP - Atrévete a jugar con joyas urbanas premium"
            fill
            priority
            sizes="(max-width: 768px) 320px, (max-width: 1024px) 384px, 450px"
            className="object-contain drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)]"
          />
        </div>

        <p className="mt-4 max-w-2xl text-lg md:text-xl text-white/90 mb-8">
          Atrévete a jugar
        </p>

        <div className="flex flex-col sm:flex-row gap-4 max-w-md w-full">
          <Link href="/productos" className="flex-1">
            <Button
              size="lg"
              className="w-full font-bold text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:scale-105"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Productos
            </Button>
          </Link>
          <Link href="/servicios-para-artistas" className="flex-1">
            <Button
              size="lg"
              variant="outline"
              className="w-full font-bold text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-black transition-all duration-300 hover:scale-105"
            >
              <Heart className="w-5 h-5 mr-2" />
              Servicios para artistas
            </Button>
          </Link>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <ArrowDown className="w-8 h-8 text-white/70" />
        <span className="sr-only">Desplázate para ver más</span>
      </div>
    </section>
  );
}