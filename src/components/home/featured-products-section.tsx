import ProductCardOptimized from '@/components/shop/product-card-optimized'
import { supabase } from '@/lib/supabase-client'
import { Product } from '@/lib/types'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

async function getFeaturedProducts(): Promise<Product[]> {
  if (!supabase) {
    console.warn(
      'Supabase client is not initialized, cannot fetch featured products.'
    )
    return []
  }

  try {
    // Obtener productos destacados o aleatorios
    const { data: allProducts, error } = (await supabase
      .from('products')
      .select('*')
      .limit(50)) as { data: Product[] | null; error: any } // Limitar para mejorar performance

    if (error) {
      console.error('Error fetching products:', error)
      return []
    }

    if (!allProducts || allProducts.length === 0) {
      return []
    }

    // Randomización del lado del servidor
    const shuffledProducts = allProducts
      .map((product) => ({ product, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ product }) => product)

    return shuffledProducts.slice(0, 6)
  } catch (error) {
    console.error('Error in getFeaturedProducts:', error)
    return []
  }
}

export default async function FeaturedProductsSection() {
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
      {featuredProducts.map((product, index) => (
        <ProductCardOptimized
          key={product.id}
          product={product}
          priority={index < 3} // Priorizar las primeras 3 imágenes
        />
      ))}
    </div>
  )
}
