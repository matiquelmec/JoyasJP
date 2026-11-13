import React, { Suspense } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { getVideoUrl } from '@/lib/safe-asset'
import { productConfig } from '@/lib/config'
import { JoyasJPLogo } from '@/components/ui/JoyasJPLogo'
import { ProductService } from '@/services/product.service'
import type { Product } from '@/lib/types'
import { SilverShowcaseCarousel } from '@/components/shop/silver-showcase-carousel'
import { CategoryBentoGrid } from '@/components/shop/category-bento-grid'
import { StyleFinderAndCare } from '@/components/shop/style-finder-and-care'

export const revalidate = 60 // Revalidación ISR de 60s + purga en 0ms vía revalidatePath

async function SilverShowcaseCarouselSection() {
  let silverProducts: Product[] = []
  try {
    silverProducts = await ProductService.getSilverProducts(8)
  } catch (error) {
    console.warn('[SilverShowcaseCarouselSection]: Error cargando joyas de plata')
  }

  return (
    <Suspense fallback={
      <div className="w-full max-w-md h-[450px] rounded-2xl bg-[#121214] border border-[#C4C9D2]/20 animate-pulse flex items-center justify-center text-[#A1A1AA]">
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
      <section className="fixed top-0 left-0 w-full h-screen overflow-hidden z-0 bg-[#09090B]">
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
        <div className="absolute top-0 left-0 w-full h-full bg-black/45" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4 pt-28 pb-16">
          <div className="mb-6 drop-shadow-[0_4px_24px_rgba(255,255,255,0.25)] animate-fadeInScale">
            <JoyasJPLogo
              variant="insignia"
              color="plata"
              size="2xl"
              priority
              asLink={false}
            />
          </div>

          <h1 className="sr-only">Joyas JP - Joyería Urbana Premium de Plata Italiana 925 y Piezas de Diseño</h1>

          <p className="mt-2 max-w-2xl text-base sm:text-lg md:text-xl font-headline font-bold text-zinc-100 tracking-[0.25em] uppercase mb-8 animate-fadeInUp-delayed-02 drop-shadow-md">
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

      {/* Bento Grid de Colecciones (Imágenes dinámicas desde el catálogo / admin) */}
      <div className="relative z-10 bg-[#09090B]">
        <CategoryBentoGridSection />
      </div>

      {/* Asistente de Estilo en 3 Pasos + Guía de Largos y Cuidado Plata 925 */}
      <div className="relative z-10 bg-[#09090B]">
        <StyleFinderAndCare />
      </div>

      {/* 🇮🇹 BANNER SHOWCASE VIP FULL-BLEED: COLECCIÓN PLATA ITALIANA 925 */}
      <section className="relative z-10 w-full bg-[#121214] border-b border-white/10 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 w-full min-h-[88vh]">
          {/* Mitad Izquierda: Narrativa Editorial & Sello 925 */}
          <div className="lg:col-span-5 flex flex-col justify-center p-8 sm:p-14 lg:p-20 space-y-6 bg-gradient-to-br from-[#09090B] via-[#121214] to-[#09090B] border-b lg:border-b-0 lg:border-r border-white/10">
            <div className="inline-flex w-fit items-center gap-2 px-4 py-1.5 bg-[#09090B] border border-[#C4C9D2]/35 text-[#C4C9D2] text-xs font-bold tracking-widest uppercase">
              <span>🇮🇹</span> IMPORTADO DE ITALIA • LEY 925 STAMPED
            </div>

            <h2 className="text-4xl sm:text-6xl font-body font-bold tracking-tight text-white leading-[1.08] uppercase">
              {(productConfig.categories.find(c => c.id === 'plata-925')?.name || 'Plata Italy 925')} <br />
              <span className="bg-gradient-to-r from-[#F6F7FA] via-[#C4C9D2] to-[#9AA0AB] bg-clip-text text-transparent">
                EL NUEVO ESTÁNDAR
              </span>
            </h2>

            <p className="text-base sm:text-lg text-[#A1A1AA] max-w-xl leading-[1.6] font-body">
              Piezas macizas moldeadas en Plata Fina de Milán. Peso real, brillo de ley y acabado pulido a mano para quienes juegan con criterio en la escena urbana.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-white bg-[#09090B] border border-[#C4C9D2]/25 px-4 py-3">
                <span className="text-[#C4C9D2]">✨</span> 92.5% Pureza Certificada
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-white bg-[#09090B] border border-[#C4C9D2]/25 px-4 py-3">
                <span className="text-[#C4C9D2]">🛡️</span> Ley 925 Sellada & Hipoalergénica
              </div>
            </div>

            <div className="pt-4">
              <Link href="/productos?categoria=plata-925" className="inline-block">
                <Button
                  size="lg"
                  className="min-h-[52px] font-bold text-base px-8 py-6 bg-[#D4113C] hover:bg-[#B30D33] text-white shadow-[0_0_24px_rgba(212,17,60,0.45)] transition-all duration-300 focus-visible:ring-[3px] focus-visible:ring-[#F43F5E]"
                >
                  Explorar {(productConfig.categories.find(c => c.id === 'plata-925')?.name || 'Plata Italy 925')}
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Mitad Derecha Full-Bleed: Escaparate Visual de Piezas de Plata Ley 925 */}
          <div className="lg:col-span-7 flex w-full h-full">
            <SilverShowcaseCarouselSection />
          </div>
        </div>
      </section>

      {/* Piezas Destacadas Full-Bleed Fluid Gallery */}
      <section className="py-20 md:py-28 bg-[#09090B] relative z-10 w-full px-4 sm:px-8 lg:px-14" style={{ contentVisibility: 'auto', containIntrinsicHeight: '800px' }}>
        <div className="w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#F43F5E] mb-2">
                Selección Principal
              </p>
              <h2 className="text-4xl md:text-6xl leading-[1.08] font-body font-bold text-white uppercase tracking-tight">
                Piezas Destacadas
              </h2>
            </div>
            <p className="text-base text-[#A1A1AA] max-w-md leading-[1.6]">
              Piezas con carácter seleccionadas para destacar tu presencia en alta resolución.
            </p>
          </div>

          <FeaturedProductsSection />

          <div className="text-center mt-14">
            <Link href="/productos" className="inline-block">
              <Button size="lg" className="min-h-[52px] font-bold px-10 bg-[#D4113C] hover:bg-[#B30D33] text-white focus-visible:ring-[3px] focus-visible:ring-[#F43F5E]">
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

async function CategoryBentoGridSection() {
  let products: Product[] = []
  let customCovers: Record<string, string> = {}
  try {
    products = await ProductService.getFeaturedProducts(40)
  } catch {
    products = []
  }
  try {
    const { turso } = await import('@/lib/db/turso')
    const { rows } = await turso.execute('SELECT category_id, image_url FROM category_covers')
    for (const row of rows as unknown as Array<{ category_id: string; image_url: string }>) {
      if (row.category_id && row.image_url) {
        customCovers[row.category_id] = row.image_url
      }
    }
  } catch {
    // Fallback automático a las imágenes prioritarias del catálogo si la tabla aún no existe
  }
  return <CategoryBentoGrid products={products} customCovers={customCovers} />
}
