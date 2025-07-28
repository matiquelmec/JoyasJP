""use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowDown, Trophy, Heart } from 'lucide-react';
// import { useDeviceType } from '@/hooks/use-mobile'; // Removido para simplificar
import { HeroLogo } from '@/components/ui/optimized-logo';

export function HeroSection() {
  // Lógica de video y dispositivo eliminada para el diagnóstico
  
  return (
    <section className="relative h-[calc(100vh+9rem)] w-full overflow-hidden mt-[-9rem]">
      {/* Fondo simplificado a una imagen estática para el diagnóstico */}
      <Image
        src="/assets/hero-poster.webp"
        alt="Fondo de Joyas JP"
        fill
        priority
        quality={75}
        sizes="100vw"
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      />
      
      {/* Overlay oscuro */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10" />
      
      {/* Contenedor de contenido reforzado con Grid para un centrado robusto */}
      <div className="relative z-20 grid place-items-center h-full text-center text-white p-4">
        
        {/* Contenedor interno para el flujo del contenido */}
        <div className="flex flex-col items-center">
          <HeroLogo />

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
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <ArrowDown className="w-8 h-8 text-white/70" />
        <span className="sr-only">Desplázate para ver más</span>
      </div>
    </section>
  );
}
