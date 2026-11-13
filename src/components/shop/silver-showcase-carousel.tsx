'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react'
import type { Product } from '@/lib/types'
import { Button } from '@/components/ui/button'

interface SilverShowcaseCarouselProps {
  products: Product[]
}

export function SilverShowcaseCarousel({ products }: SilverShowcaseCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // Autoplay cada 4 segundos si no se pasa el cursor por encima
  useEffect(() => {
    if (products.length <= 1 || isHovered) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length)
    }, 4200)

    return () => clearInterval(timer)
  }, [products.length, isHovered])

  if (!products || products.length === 0) {
    return (
      <div className="relative group p-8 rounded-2xl bg-[#121214] border border-[#C4C9D2]/30 shadow-2xl text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#C4C9D2]/10 border border-[#C4C9D2]/30 flex items-center justify-center text-3xl">
          🇮🇹
        </div>
        <h3 className="text-xl font-bold text-white">Sello de Origen Italiano</h3>
        <p className="text-xs text-[#A1A1AA]">Pureza certificada de Plata Ley 925 importada directamente de Milán.</p>
      </div>
    )
  }

  const currentProduct = products[currentIndex]
  const formatter = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  })

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1))
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length)
  }

  return (
    <div
      className="relative group w-full max-w-md mx-auto rounded-2xl bg-[#121214] border border-[#C4C9D2]/30 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-xl overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Badge Stamp (Plata Milán #C4C9D2 sobre Negro Noche #09090B = 11.97:1 WCAG AAA) */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#09090B]/90 border border-[#C4C9D2]/35 backdrop-blur-md shadow-lg">
        <span className="text-xs">🇮🇹</span>
        <span className="text-[10px] font-black tracking-widest text-[#C4C9D2] uppercase">
          925 STAMPED
        </span>
      </div>

      {/* Counter Badge */}
      <div className="absolute top-4 right-4 z-20 px-2.5 py-0.5 rounded-full bg-[#09090B]/90 border border-zinc-800 text-[10px] font-mono text-[#C4C9D2]">
        {currentIndex + 1} / {products.length}
      </div>

      {/* Imagen Principal del Producto con Transición */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#09090B]">
        <Image
          key={currentProduct.id}
          src={currentProduct.imageUrl}
          alt={currentProduct.name}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover transition-all duration-700 group-hover:scale-105"
          priority
        />
        
        {/* Shadow overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-transparent opacity-80" />
      </div>

      {/* Detalle flotante de la joya */}
      <div className="p-6 space-y-4 text-left relative z-10 -mt-12 bg-gradient-to-t from-[#09090B] via-[#09090B]/95 to-transparent">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#C4C9D2] shrink-0" />
            <span className="text-[11px] font-bold text-[#C4C9D2] tracking-wider uppercase">
              {currentProduct.materials || 'Plata Italiana 925'}
            </span>
          </div>
          <h3 className="text-[24px] sm:text-[28px] leading-[1.2] font-headline font-bold text-white tracking-tight line-clamp-1">
            {currentProduct.name}
          </h3>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
          <div>
            <span className="block text-[10px] text-[#A1A1AA] uppercase font-semibold tracking-wider">Precio</span>
            <span className="text-[24px] sm:text-[28px] leading-[1.1] font-headline font-bold text-[#C4C9D2]">
              {formatter.format(currentProduct.discount_price || currentProduct.price)}
            </span>
          </div>

          <Link href={`/productos/${currentProduct.slug || currentProduct.id}`}>
            <Button size="sm" className="min-h-[44px] bg-[#D4113C] text-white hover:bg-[#B30D33] font-bold text-xs px-5 focus-visible:ring-[3px] focus-visible:ring-[#F43F5E]">
              Ver Pieza
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Flechas de Navegación manual (Touch target >= 44x44px) */}
      {products.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Ver pieza anterior"
            className="absolute left-2 top-1/3 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#09090B]/80 border border-[#C4C9D2]/35 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#D4113C] hover:text-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#F43F5E]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Ver siguiente pieza"
            className="absolute right-2 top-1/3 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#09090B]/80 border border-[#C4C9D2]/35 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#D4113C] hover:text-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#F43F5E]"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Indicadores en barra inferior */}
      {products.length > 1 && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-20 flex gap-1">
          {products.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none"
              aria-label={`Ir a pieza ${idx + 1}`}
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'w-6 bg-[#C4C9D2]' : 'w-1.5 bg-zinc-700'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
