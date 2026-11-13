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

  useEffect(() => {
    if (products.length <= 1 || isHovered) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length)
    }, 4500)

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
    minimumFractionDigits: 0,
  })

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1))
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length)
  }

  return (
    <div
      className="relative group w-full max-w-xl mx-auto rounded-2xl bg-[#121214] border border-[#C4C9D2]/30 shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Badge Stamp */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#09090B]/90 border border-[#C4C9D2]/40 backdrop-blur-md shadow-lg">
        <span className="text-xs">🇮🇹</span>
        <span className="text-[11px] font-black tracking-widest text-[#C4C9D2] uppercase">
          925 STAMPED
        </span>
      </div>

      {/* Counter Badge */}
      <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-[#09090B]/90 border border-white/15 text-xs font-mono text-[#C4C9D2]">
        {currentIndex + 1} / {products.length}
      </div>

      {/* Imagen Editorial 4:5 en Alta Resolución sin velo que apague el metal */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#09090B]">
        <Image
          key={currentProduct.id}
          src={currentProduct.imageUrl}
          alt={currentProduct.name}
          fill
          quality={92}
          sizes="(max-width: 768px) 95vw, 560px"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          priority
        />

        {products.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-[#09090B]/85 border border-white/20 text-white flex items-center justify-center hover:bg-[#D4113C] hover:border-[#D4113C] transition-all shadow-lg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#F43F5E]"
              aria-label="Joya anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-[#09090B]/85 border border-white/20 text-white flex items-center justify-center hover:bg-[#D4113C] hover:border-[#D4113C] transition-all shadow-lg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#F43F5E]"
              aria-label="Siguiente joya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Barra de Miniaturas Interactivas */}
      {products.length > 1 && (
        <div className="flex items-center gap-2 px-5 pt-4 pb-1 overflow-x-auto scrollbar-none bg-[#09090B]">
          {products.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Ver ${item.name}`}
              className={`relative h-14 w-14 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                idx === currentIndex
                  ? 'border-[#D4113C] scale-105 shadow-[0_0_12px_rgba(212,17,60,0.5)]'
                  : 'border-white/10 opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="56px"
                quality={75}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Pie Editorial Separado (No tapa la joya) */}
      <div className="p-6 space-y-4 text-left bg-[#09090B] border-t border-white/10">
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
            <span className="block text-[10px] text-[#A1A1AA] uppercase font-semibold tracking-wider">
              Precio
            </span>
            <span className="text-[24px] sm:text-[28px] leading-[1.1] font-headline font-bold text-[#C4C9D2]">
              {formatter.format(currentProduct.discount_price || currentProduct.price)}
            </span>
          </div>

          <Link href={`/productos/${currentProduct.slug || currentProduct.id}`}>
            <Button
              size="sm"
              className="min-h-[44px] bg-[#D4113C] text-white hover:bg-[#B30D33] font-bold text-xs px-5 focus-visible:ring-[3px] focus-visible:ring-[#F43F5E]"
            >
              Ver Pieza
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
