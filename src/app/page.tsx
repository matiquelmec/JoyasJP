import React, { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { getVideoUrl, getImageUrl } from '@/lib/asset-version'
import { supabase } from '@/lib/supabase-client'
import type { Product } from '@/lib/types'

// ⚡ DYNAMIC IMPORT para componente pesado
const LazyProductCard = dynamic(() => import('@/components/shop/lazy-product-card'), {
  loading: () => <ProductSkeleton />,
  ssr: true
})

// 🎯 ESTRATEGIAS DE SELECCIÓN ALEATORIA OPTIMIZADA
function getRandomStrategy(): 'pure_random' | 'weighted_categories' | 'stock_weighted' | 'time_based' {
  const strategies = ['pure_random', 'weighted_categories', 'stock_weighted', 'time_based'] as const
  return strategies[Math.floor(Math.random() * strategies.length)]
}

function fisherYatesShuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

async function getFeaturedProducts(): Promise<Product[]> {
  if (!supabase) {
    return []
  }

  try {
    // Obtener productos con stock disponible únicamente
    const { data: allProducts, error } = (await supabase
      .from('products')
      .select('*')
      .gt('stock', 0)
      .limit(25)) as { data: Product[] | null; error: any }

    if (error) {
      // console.error('Error fetching products:', error)
      return []
    }

    if (!allProducts || allProducts.length === 0) {
      return []
    }

    const strategy = getRandomStrategy()
    let selectedProducts: Product[] = []

    switch (strategy) {
      case 'pure_random':
        // 🎲 Aleatorio puro con Fisher-Yates shuffle
        selectedProducts = fisherYatesShuffle(allProducts).slice(0, 6)
        break

      case 'weighted_categories':
        // 🏷️ Selección balanceada por categorías
        const categories = Array.from(new Set(allProducts.map(p => p.category)))
        const productsPerCategory = Math.ceil(6 / categories.length)

        selectedProducts = categories.flatMap(category => {
          const categoryProducts = allProducts.filter(p => p.category === category)
          return fisherYatesShuffle(categoryProducts).slice(0, productsPerCategory)
        }).slice(0, 6)
        break

      case 'stock_weighted':
        // 📦 Ponderado por stock (más stock = más probabilidad)
        const weightedProducts = allProducts.map(product => ({
          product,
          weight: Math.log(product.stock + 1) * Math.random()
        }))
          .sort((a, b) => b.weight - a.weight)
          .map(({ product }) => product)

        selectedProducts = weightedProducts.slice(0, 6)
        break

      case 'time_based':
        // ⏰ Rotación basada en tiempo (cambia cada hora)
        const hourSeed = Math.floor(Date.now() / (1000 * 60 * 60))
        const seededRandom = (seed: number) => {
          const x = Math.sin(seed) * 10000
          return x - Math.floor(x)
        }

        const timeShuffled = allProducts
          .map((product, index) => ({
            product,
            sort: seededRandom(hourSeed + index)
          }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ product }) => product)

        selectedProducts = timeShuffled.slice(0, 6)
        break
    }

    // 🔄 Fallback: asegurar que siempre haya exactamente 6 productos
    if (selectedProducts.length < 6 && allProducts.length >= 6) {
      // Si no hay suficientes productos de la estrategia, completar con aleatorios
      const remaining = allProducts.filter(p => !selectedProducts.includes(p))
      const additionalProducts = fisherYatesShuffle(remaining).slice(0, 6 - selectedProducts.length)
      selectedProducts = [...selectedProducts, ...additionalProducts]
    }

    // Fallback shuffle final para máxima aleatoriedad
    return fisherYatesShuffle(selectedProducts.slice(0, 6))

  } catch (error) {
    // console.error('Error in getFeaturedProducts:', error)
    return []
  }
}

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

async function FeaturedProducts() {
  const featuredProducts = await getFeaturedProducts()

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
