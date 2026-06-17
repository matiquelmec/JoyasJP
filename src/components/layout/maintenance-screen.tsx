'use client'

import React from 'react'
import Image from 'next/image'
import { MessageCircle, Instagram } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getImageUrl } from '@/lib/asset-version'
import { siteConfig } from '@/lib/config'

export function MaintenanceScreen() {
  const whatsappUrl = siteConfig.links.whatsapp
  const instagramUrl = siteConfig.links.instagram
  const tiktokUrl = siteConfig.links.tiktok

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-between text-white px-6 py-12 relative overflow-hidden font-body select-none">
      {/* Glow Efecto Dorado de Fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header / Espaciador Superior */}
      <div className="w-full max-w-7xl flex justify-center sm:justify-start items-center opacity-80 z-10">
        <span className="font-bebas text-2xl tracking-widest text-[#D4AF37]">JOYAS JP</span>
      </div>

      {/* Contenido Principal */}
      <div className="flex flex-col items-center justify-center text-center max-w-2xl my-auto z-10">
        {/* Logo con Animación Pulse */}
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-[#D4AF37]/10 rounded-full blur-xl animate-pulse scale-95" />
          <Image
            src={getImageUrl('logo.webp')}
            alt="Joyas JP - Logo"
            width={180}
            height={180}
            priority
            className="relative h-auto w-36 sm:w-44 drop-shadow-[0_2px_15px_rgba(212,175,55,0.2)]"
          />
        </div>

        {/* Badge Especial */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 uppercase tracking-widest mb-6 animate-pulse">
          Ajustes de Catálogo
        </span>

        {/* Títulos */}
        <h1 className="font-bebas text-4xl sm:text-6xl tracking-wider mb-4 text-white">
          VOLVEMOS CON MÁS BRILLO
        </h1>
        
        <p className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-lg mb-8 leading-relaxed">
          Estamos actualizando nuestro stock y mejorando nuestra vitrina digital para ofrecerte la mejor experiencia en alta joyería urbana. 
        </p>

        {/* Botón Principal (WhatsApp) */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto font-bold text-base px-8 py-6 bg-[#D4AF37] text-black hover:bg-[#bfa032] transition-all duration-300 hover:scale-105 shadow-[0_4px_20px_rgba(212,175,55,0.25)] flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              Escríbenos por WhatsApp
            </Button>
          </a>
        </div>

        <p className="text-zinc-500 text-xs mt-4">
          ¿Buscas una pieza específica? Consúltanos directamente.
        </p>
      </div>

      {/* Footer / Redes Sociales */}
      <div className="w-full max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-900 pt-8 z-10">
        <p className="text-zinc-500 text-xs text-center sm:text-left">
          © {new Date().getFullYear()} Joyas JP. Todos los derechos reservados.
        </p>
        
        <div className="flex items-center gap-6">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-[#D4AF37] transition-colors duration-300"
            aria-label="Instagram de Joyas JP"
          >
            <Instagram className="w-5 h-5" />
          </a>
          <a
            href={tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-[#D4AF37] transition-colors duration-300 font-bebas text-base tracking-wider"
            aria-label="TikTok de Joyas JP"
          >
            TIKTOK
          </a>
        </div>
      </div>
    </div>
  )
}
