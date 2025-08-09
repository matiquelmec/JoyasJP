import { ArrowDown, Heart, Trophy } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import ProductCard from '@/components/shop/product-card'
import { Button } from '@/components/ui/button'
import { PageTransition } from '@/components/ui/page-transition'
import { supabase } from '@/lib/supabase-client'
import type { Product } from '@/lib/types'

// Dynamic import del VideoHero para mejorar performance inicial
const VideoHero = dynamic(() => import('@/components/layout/video-hero').then(mod => ({ default: mod.VideoHero })), {
  ssr: false, // No SSR para mejor LCP
  loading: () => (
    <section className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-zinc-900 via-black to-zinc-900">
      {/* Simulated video background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-black/60" />
      
      {/* Content skeleton matching VideoHero layout */}
      <div className="relative flex flex-col items-center justify-center h-full text-center text-white p-4 pt-24 sm:pt-28 md:pt-36 lg:pt-44" style={{ zIndex: 10 }}>
        {/* Logo skeleton without white glow */}
        <div className="mb-8 relative">
          <div className="relative w-80 md:w-96 lg:w-[450px] h-32 md:h-40 lg:h-48 bg-gradient-to-br from-zinc-700 to-zinc-800 animate-pulse rounded-lg shadow-2xl" />
        </div>

        {/* Slogan skeleton */}
        <div className="h-6 bg-zinc-700 animate-pulse rounded w-48 mb-8" />

        {/* Buttons skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 max-w-md w-full mb-16">
          <div className="flex-1 h-14 bg-primary/30 animate-pulse rounded-md" />
          <div className="flex-1 h-14 bg-zinc-700/50 animate-pulse rounded-md border border-zinc-700" />
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
          <div className="w-8 h-8 bg-zinc-700/50 animate-bounce rounded-full" />
        </div>
      </div>

      {/* Bottom fade matching VideoHero */}
      <div className="absolute bottom-0 left-0 right-0 h-40 sm:h-32 bg-gradient-to-t from-background via-background/90 to-transparent" style={{ zIndex: 4 }} />
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-background" style={{ zIndex: 4 }} />
    </section>
  )
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
    console.warn(
      'Supabase client is not initialized, cannot fetch featured products.'
    )
    return []
  }

  try {
    // Obtener productos con stock disponible únicamente
    const { data: allProducts, error } = (await supabase
      .from('products')
      .select('*')
      .gt('stock', 0)) as { data: Product[] | null; error: any }

    if (error) {
      console.error('Error fetching products:', error)
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

    // 🔄 Fallback shuffle final para máxima aleatoriedad
    return fisherYatesShuffle(selectedProducts)

  } catch (error) {
    console.error('Error in getFeaturedProducts:', error)
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
        <Link href="/contact">
          <Button className="mt-4" variant="outline">
            Contáctanos para más información
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {featuredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <PageTransition>
      <div className="flex flex-col -mt-36 md:-mt-40">
        {/* Video Hero Section */}
        <VideoHero />

        {/* Featured Products Section */}
        <section className="pt-8 pb-20 md:pt-16 md:pb-28 bg-background">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-headline font-bold mb-4 animate-fadeInUp">
                Piezas Destacadas
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fadeInUp [animation-delay:200ms]">
                Descubre nuestra selección de joyas únicas, diseñadas para
                expresar tu personalidad y estilo.
              </p>
            </div>

            <div className="animate-fadeInUp [animation-delay:400ms]">
              <FeaturedProductsSection />
            </div>

            <div className="text-center mt-12 animate-fadeInUp [animation-delay:600ms]">
              <Link href="/shop">
                <Button size="lg" className="font-semibold px-8">
                  Ver Todos los Productos
                  <ArrowDown className="w-4 h-4 ml-2 rotate-[-90deg]" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </PageTransition>
  )
}
