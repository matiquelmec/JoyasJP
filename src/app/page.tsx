import React, { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { getVideoUrl, getImageUrl } from '@/lib/asset-version'
import { ProductService } from '@/services/product.service'
import type { Product } from '@/lib/types'
import { SilverShowcaseCarousel } from '@/components/shop/silver-showcase-carousel'

export const revalidate = 43200 // Habilitar caché de 12 horas en el CDN (ISR)

async function SilverShowcaseCarouselSection() {
  let silverProducts: Product[] = []
  try {
    silverProducts = await ProductService.getSilverProducts(8)
  } catch (error) {
    console.warn('[SilverShowcaseCarouselSection]: Error cargando joyas de plata')
  }

  return (
    <Suspense fallback={
      <div className="w-full max-w-md h-[450px] rounded-2xl bg-zinc-900/50 border border-amber-500/20 animate-pulse flex items-center justify-center text-zinc-500">
        Cargando Bóveda Plata 925...
      </div>
    }>
      <SilverShowcaseCarousel products={silverProducts} />
    </Suspense>
  )
}




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
      <section className="relative z-10 py-20 md:py-28 bg-gradient-to-b from-black via-zinc-950 to-background border-y border-amber-500/20 overflow-hidden">
        {/* Glow de luz dorada y metálica de fondo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[400px] h-[250px] bg-slate-300/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Texto & Branding VIP */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black tracking-widest uppercase shadow-xl backdrop-blur-md">
                <span>🇮🇹</span> IMPORTADO DE ITALIA • LEY 925 STAMPED
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15] drop-shadow-[0_2px_20px_rgba(212,175,55,0.2)]">
                PLATA ITALIANA 925 <br />
                <span className="bg-gradient-to-r from-amber-200 via-primary to-amber-400 bg-clip-text text-transparent">
                  EL NUEVO ESTÁNDAR
                </span>
              </h2>

              <p className="text-base sm:text-lg text-zinc-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                Piezas macizas moldeadas en Plata Fina de Milán. Brillo eterno, densidad metálica superior y acabado pulido a mano para quienes exigen la más alta calidad urbana.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200 bg-zinc-900/90 border border-amber-500/20 px-3.5 py-2 rounded-xl shadow-md">
                  <span className="text-amber-400">✨</span> 92.5% Pureza Certificada
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200 bg-zinc-900/90 border border-amber-500/20 px-3.5 py-2 rounded-xl shadow-md">
                  <span className="text-slate-300">🛡️</span> Inalterable & Hipoalergénico
                </div>
              </div>

              <div className="pt-4">
                <Link href="/productos?categoria=plata-925">
                  <Button
                    size="lg"
                    className="font-extrabold text-base px-8 py-6 bg-primary text-black hover:bg-primary/90 hover:scale-105 shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all duration-300"
                  >
                    Explorar Bóveda Plata 925
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Carrusel Visual de Piezas de Plata Ley 925 */}
            <div className="lg:col-span-5 flex justify-center">
              <SilverShowcaseCarouselSection />
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
