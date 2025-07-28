"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';
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
      
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center text-white px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <Image
            src="/assets/logo.webp"
            alt="Joyas JP Logo"
            width={deviceType === 'mobile' ? 180 : 240}
            height={deviceType === 'mobile' ? 180 : 240}
            priority
            className="mx-auto animate-fade-in"
          />
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight animate-fade-in-up">
            Atrévete a jugar
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-gray-200 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            Descubre nuestra exclusiva colección de joyas urbanas premium. 
            Cada pieza cuenta una historia única de estilo y personalidad.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-400">
            <Link href="/productos">
              <Button 
                size="lg" 
                className="bg-white text-black hover:bg-gray-100 font-semibold px-8 py-4 text-lg transition-all duration-300 hover:scale-105"
              >
                Explorar Productos
              </Button>
            </Link>
            <Link href="/nosotros">
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-black font-semibold px-8 py-4 text-lg transition-all duration-300 hover:scale-105"
              >
                Servicios para artistas
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ArrowDown className="w-8 h-8 text-white/80" />
        </div>
      </div>
    </section>
  );
}