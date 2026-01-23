import React, { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { getVideoUrl, getImageUrl } from '@/lib/asset-version'
import { ProductService } from '@/services/product.service'
import type { Product } from '@/lib/types'

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
  // ⚡ Optimización: Usamos la nueva función RPC de base de datos
  const featuredProducts = await ProductService.getFeaturedProducts(6)

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
      <section className="fixed top-0 left-0 w-full h-screen overflow-hidden z-0">
        <video
          src={getVideoUrl('mi-video.mp4')}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute top-0 left-0 w-full h-full object-cover"
          aria-label="Video promocional de Joyas JP"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-black/40" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-3 sm:px-4 pt-44 sm:pt-48 md:pt-52 lg:pt-56 xl:pt-60 pb-20">
          <Image
            src={getImageUrl('logo.webp')}
            alt="Joyas JP - Alta joyería para la escena urbana"
            width={320}
            height={320}
            priority
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            className="h-auto w-64 sm:w-72 md:w-80 lg:w-96 mb-6 drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)] animate-fadeInScale"
            sizes="(max-width: 640px) 256px, (max-width: 768px) 288px, (max-width: 1024px) 320px, 384px"
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

      {/* Featured Products Section */}
      <section className="py-20 md:py-28 bg-background relative z-10">
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
