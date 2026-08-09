import React, { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { getVideoUrl, getImageUrl } from '@/lib/asset-version'
import { ProductService } from '@/services/product.service'
import type { Product } from '@/lib/types'

export const revalidate = 43200 // Habilitar caché de 12 horas en el CDN (ISR)




// ⚡ DYNAMIC IMPORT para componente pesado
const LazyProductCard = dynamic(() => import('@/components/shop/lazy-product-card'), {
  loading: () => <ProductSkeleton />,
  ssr: true
})

// Local helpers removed in favor of Database Optimization


function ProductSkeleton() {
  return (
    <div className="group border border-border/50 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 bg-card/50 animate-pulse">
      {/* Image skeleton with shimmer */}
      <div className="aspect-square bg-gradient-to-br from-zinc-800 to-zinc-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-600/30 to-transparent animate-shimmer" />
      </div>
      <div className="p-6">
        {/* Title skeleton */}
        <div className="h-5 bg-gradient-to-r from-zinc-700 to-zinc-600 rounded-lg mb-3 animate-pulse" />

        {/* Description skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-zinc-700/80 rounded w-3/4 animate-pulse" />
          <div className="h-3 bg-zinc-700/60 rounded w-1/2 animate-pulse" />
        </div>

        {/* Price skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gradient-to-r from-primary/30 to-primary/20 rounded-lg w-24 animate-pulse" />
          <div className="w-9 h-9 bg-zinc-700/50 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  )
}

async function FeaturedProducts() {
  let featuredProducts: Product[] = []

  try {
    // ⚡ Optimización: Usamos la nueva función RPC de base de datos
    featuredProducts = await ProductService.getFeaturedProducts(6)
  } catch (error) {
    console.warn('[FeaturedProducts]: Error cargando productos, mostrando estado vacío.')
  }

  if (featuredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">Próximamente</h3>
        <p className="text-muted-foreground">
          Estamos preparando nuestra increíble colección para ti.
        </p>
        <Link href="/contacto">
          <Button className="mt-4" variant="outline">
            Contáctanos para más información
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {featuredProducts.map((product, index) => (
        <LazyProductCard
          key={product.id}
          product={product}
          priority={index < 3} // Los primeros 3 productos se cargan inmediatamente
        />
      ))}
    </div>
  )
}

function FeaturedProductsSection() {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      }
    >
      <FeaturedProducts />
    </Suspense>
  )
}

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="fixed top-0 left-0 w-full h-screen overflow-hidden z-0 bg-black">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute top-0 left-0 w-full h-full object-cover"
          aria-label="Video promocional de Joyas JP"
        >
          <source src={getVideoUrl('mi-video.mp4')} type="video/mp4" />
          <source src={getVideoUrl('mi-video.webm')} type="video/webm" />
        </video>
        <div className="absolute top-0 left-0 w-full h-full bg-black/40" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-3 sm:px-4 pt-44 sm:pt-48 md:pt-52 lg:pt-56 xl:pt-60 pb-20">
          <Image
            src={getImageUrl('logo.webp')}
            alt="Joyas JP - Alta joyería para la escena urbana"
            width={240} // Tamaño visual real optimizado
            height={240}
            priority
            fetchPriority="high"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxAPwCdABmX/9k="
            className="h-auto w-48 sm:w-56 md:w-60 lg:w-64 mb-6 drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)] animate-fadeInScale"
            sizes="(max-width: 640px) 192px, (max-width: 1024px) 240px, 256px"
          />

          <p className="mt-4 max-w-2xl text-lg md:text-xl text-white/90 mb-8 animate-fadeInUp-delayed-02 uppercase tracking-wider">
            ATRÉVETE A JUGAR
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-md w-full animate-fadeInUp-delayed-04">
            <Link href="/productos" className="flex-1">
              <Button
                size="lg"
                className="w-full font-bold text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:scale-105"
              >
                Ver Colección
              </Button>
            </Link>
            <Link href="/servicios" className="flex-1">
              <Button
                size="lg"
                variant="outline"
                className="w-full font-bold text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-black transition-all duration-300 hover:scale-105"
              >
                Servicios
              </Button>
            </Link>
          </div>
        </div>

      </section>

      {/* Spacer for fixed video */}
      <div className="h-screen"></div>

      {/* 🇮🇹 BANNER SHOWCASE VIP: COLECCIÓN PLATA ITALIANA 925 */}
      <section className="relative z-10 py-20 md:py-28 bg-gradient-to-b from-slate-950 via-slate-900 to-background border-y border-slate-800/80 overflow-hidden">
        {/* Glow de luz metálica cromo de fondo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-slate-400/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Texto & Branding VIP */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-200/10 border border-slate-300/30 text-slate-200 text-xs font-black tracking-widest uppercase shadow-xl backdrop-blur-md">
                <span>🇮🇹</span> IMPORTADO DE ITALIA • LEY 925 STAMPED
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-100 leading-[1.15] drop-shadow-[0_0_25px_rgba(255,255,255,0.25)]">
                PLATA ITALIANA 925 <br />
                <span className="bg-gradient-to-r from-slate-200 via-white to-slate-400 bg-clip-text text-transparent">
                  EL NUEVO ESTÁNDAR
                </span>
              </h2>

              <p className="text-base sm:text-lg text-slate-300/80 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                Piezas macizas moldeadas en Plata Fina de Milán. Brillo eterno, densidad metálica superior y acabado pulido a mano para quienes exigen la más alta calidad urbana.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-900/80 border border-slate-800 px-3 py-2 rounded-lg">
                  <span className="text-amber-400">✨</span> 92.5% Pureza Certificada
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-900/80 border border-slate-800 px-3 py-2 rounded-lg">
                  <span className="text-blue-400">🛡️</span> Inalterable & Hipoalergénico
                </div>
              </div>

              <div className="pt-4">
                <Link href="/productos">
                  <Button
                    size="lg"
                    className="font-extrabold text-base px-8 py-6 bg-gradient-to-r from-slate-100 via-white to-slate-300 text-slate-950 hover:scale-105 shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all duration-300"
                  >
                    Explorar Bóveda Plata 925
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Tarjeta Visual de Impacto */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group p-8 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl max-w-md w-full text-center space-y-6 transform group-hover:scale-[1.02] transition-all duration-500">
                <div className="w-20 h-20 mx-auto rounded-full bg-slate-800/80 border border-slate-300/40 flex items-center justify-center text-4xl shadow-inner">
                  🇮🇹
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-100">Sello de Origen Italiano</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Cada cadena y pulsera cuenta con el grabado oficial de ley 925 importada, garantizando autenticidad internacional.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs text-slate-300 font-mono">
                  <span>PUREZA: 92.5%</span>
                  <span className="text-amber-400 font-bold">MILANO LUXURY</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 md:py-28 bg-background relative z-10" style={{ contentVisibility: 'auto', containIntrinsicHeight: '800px' }}>
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-headline font-bold mb-4">
              Piezas Destacadas
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Descubre nuestra selección de joyas únicas, diseñadas para
              expresar tu personalidad y estilo.
            </p>
          </div>

          <FeaturedProductsSection />

          <div className="text-center mt-12">
            <Link href="/productos">
              <Button size="lg" className="font-semibold px-8">
                Ver Toda la Colección
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
