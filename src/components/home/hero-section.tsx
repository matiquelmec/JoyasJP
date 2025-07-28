"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowDown, Trophy, Heart } from 'lucide-react';
import { useDeviceType } from '@/hooks/use-mobile';
import { useEffect, useState } from 'react';

export function HeroSection() {
  const { deviceType, connectionType, isClient } = useDeviceType();
  const [shouldShowVideo, setShouldShowVideo] = useState(false);

  useEffect(() => {
    if (!isClient) return;
    
    // Solo mostrar video en desktop con conexión rápida
    const showVideo = deviceType === 'desktop' && connectionType === 'fast';
    setShouldShowVideo(showVideo);
  }, [deviceType, connectionType, isClient]);

  return (
    <section className="relative h-[calc(100vh+9rem)] w-full overflow-hidden mt-[-9rem]">
      {shouldShowVideo ? (
        <video
          src="/assets/mi-video.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/assets/hero-poster.webp"
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          aria-label="Video promocional de Joyas JP"
        />
      ) : (
        <Image
          src="/assets/hero-poster.webp"
          alt="Joyas JP - Atrévete a jugar con joyas urbanas premium"
          fill
          priority
          quality={deviceType === 'mobile' ? 75 : 90}
          sizes="100vw"
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
      )}
      
      <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10" />
      
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center text-white p-4">
        <Image
          src="/assets/logo.webp"
          alt="Joyas JP - Alta joyería para la escena urbana"
          width={500}
          height={500}
          priority
          fetchPriority="high"
          className="h-auto w-80 md:w-96 lg:w-[450px] mb-6 drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)]"
        />

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