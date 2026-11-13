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
      <div className="relative group p-12 bg-[#121214] border border-[#C4C9D2]/30 text-center space-y-4 w-full min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#C4C9D2]/10 border border-[#C4C9D2]/30 flex items-center justify-center text-3xl">
          🇮🇹
        </div>
        <h3 className="text-2xl font-bold text-white">Sello de Origen Italiano</h3>
        <p className="text-sm text-[#A1A1AA]">Pureza certificada de Plata Ley 925 importada directamente de Milán.</p>
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
      className="relative group w-full h-full flex flex-col bg-[#09090B] overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Badge Stamp */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-1.5 bg-[#09090B]/85 border border-[#C4C9D2]/40 backdrop-blur-md">
        <span className="text-xs">🇮🇹</span>
        <span className="text-[11px] font-black tracking-[0.2em] text-[#C4C9D2] uppercase">
          925 STAMPED
        </span>
      </div>

      {/* Counter Badge */}
      <div className="absolute top-6 right-6 z-20 px-3.5 py-1 bg-[#09090B]/85 border border-white/15 text-xs font-mono text-[#C4C9D2]">
        {currentIndex + 1} / {products.length}
      </div>

      {/* Full-Bleed Monumental Image */}
      <div className="relative min-h-[65vh] lg:min-h-[74vh] w-full flex-1 overflow-hidden bg-[#09090B]">
        <Image
          key={currentProduct.id}
          src={currentProduct.imageUrl}
          alt={currentProduct.name}
          fill
          quality={95}
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          priority
        />

        {products.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-[#09090B]/85 border border-white/25 text-white flex items-center justify-center hover:bg-[#D4113C] hover:border-[#D4113C] transition-all shadow-xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#F43F5E]"
              aria-label="Joya anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-[#09090B]/85 border border-white/25 text-white flex items-center justify-center hover:bg-[#D4113C] hover:border-[#D4113C] transition-all shadow-xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#F43F5E]"
              aria-label="Siguiente joya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Barra de Miniaturas + Pie Editorial Full-Bleed */}
      <div className="p-6 sm:p-8 lg:p-10 space-y-5 bg-[#09090B] border-t border-white/10">
        {products.length > 1 && (
          <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none pb-2">
            {products.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Ver ${item.name}`}
                className={`relative h-16 w-16 shrink-0 overflow-hidden border-2 transition-all ${
                  idx === currentIndex
                    ? 'border-[#D4113C] scale-105'
                    : 'border-white/10 opacity-55 hover:opacity-100'
                }`}
              >
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="64px"
                  quality={80}
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#C4C9D2] shrink-0" />
              <span className="text-xs font-bold text-[#C4C9D2] tracking-widest uppercase">
                {currentProduct.materials || 'Plata Italiana 925'}
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl leading-[1.15] font-headline font-bold text-white tracking-tight">
              {currentProduct.name}
            </h3>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <span className="block text-[10px] text-[#A1A1AA] uppercase font-semibold tracking-wider">
                Precio
              </span>
              <span className="text-2xl sm:text-3xl leading-[1.1] font-headline font-bold text-[#C4C9D2]">
                {formatter.format(currentProduct.discount_price || currentProduct.price)}
              </span>
            </div>

            <Link href={`/productos/${currentProduct.slug || currentProduct.id}`}>
              <Button
                size="lg"
                className="min-h-[48px] bg-[#D4113C] text-white hover:bg-[#B30D33] font-bold text-sm px-6 focus-visible:ring-[3px] focus-visible:ring-[#F43F5E]"
              >
                Ver Pieza
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
