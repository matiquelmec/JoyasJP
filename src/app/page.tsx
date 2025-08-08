import { ArrowDown, Heart, Trophy } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import ProductCard from '@/components/shop/product-card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase-client'
import type { Product } from '@/lib/types'

// Dynamic import del VideoHero para mejorar performance inicial
const VideoHero = dynamic(() => import('@/components/layout/video-hero').then(mod => ({ default: mod.VideoHero })), {
  ssr: true, // Mantenemos SSR para SEO
  loading: () => (
    <section className="relative h-screen w-screen overflow-hidden bg-gradient-to-b from-zinc-900 to-black flex items-center justify-center">
      <div className="text-center text-white">
        <div className="w-80 h-40 bg-zinc-800 animate-pulse rounded-lg mb-8 mx-auto" />
        <div className="h-6 bg-zinc-800 animate-pulse rounded w-48 mx-auto" />
      </div>
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
    <div className="border rounded-lg overflow-hidden shadow-sm animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded mb-2" />
        <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
        <div className="h-5 bg-gray-200 rounded w-1/2" />
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
    <div className="flex flex-col -mt-36 md:-mt-40">
      {/* Video Hero Section */}
      <VideoHero />

      {/* Featured Products Section */}
      <section className="pt-8 pb-20 md:pt-16 md:pb-28 bg-background">
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
  )
}
