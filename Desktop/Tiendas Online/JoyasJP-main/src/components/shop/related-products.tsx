'use client'

import { useEffect, useState } from 'react'
import ProductCard from '@/components/shop/product-card'
import { Separator } from '@/components/ui/separator'
import { supabase } from '@/lib/supabase-client'
import type { Product } from '@/lib/types'

interface RelatedProductsProps {
  currentProductId: string
  category: string
}

export function RelatedProducts({
  currentProductId,
  category,
}: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [otherProducts, setOtherProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        if (!supabase) {
          throw new Error('Supabase client is not initialized.')
        }
        
        // Obtener productos relacionados (misma categoría)
        const { data: relatedData, error: relatedError } = await supabase
          .from('products')
          .select('*')
          .eq('category', category)
          .neq('id', currentProductId)
          .gt('stock', 0)
          .limit(4)

        if (relatedError) {
          throw relatedError
        }

        // Obtener otros productos (diferentes categorías)
        const { data: otherData, error: otherError } = await supabase
          .from('products')
          .select('*')
          .neq('category', category)
          .neq('id', currentProductId)
          .gt('stock', 0)
          .limit(4)

        if (otherError) {
          throw otherError
        }

        setRelatedProducts(relatedData as unknown as Product[])
        
        // Mezclar aleatoriamente los otros productos para variedad
        const shuffledOthers = (otherData as unknown as Product[])
          .sort(() => Math.random() - 0.5)
        setOtherProducts(shuffledOthers)
        
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [currentProductId, category])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-2xl lg:text-3xl font-headline font-bold">Productos Relacionados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl lg:text-3xl font-headline font-bold">Productos Relacionados</h2>
        <p className="text-red-500">
          Error al cargar productos: {error}
        </p>
      </div>
    )
  }

  const hasRelatedProducts = relatedProducts.length > 0
  const hasOtherProducts = otherProducts.length > 0

  if (!hasRelatedProducts && !hasOtherProducts) {
    return null
  }

  return (
    <div className="space-y-12">
      {/* Productos Relacionados (misma categoría) */}
      {hasRelatedProducts && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl lg:text-3xl font-headline font-bold">
              Más {category.charAt(0).toUpperCase() + category.slice(1)}
            </h2>
            <p className="text-muted-foreground">
              Otros productos de la misma categoría que podrían interesarte
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Separador si hay ambas secciones */}
      {hasRelatedProducts && hasOtherProducts && (
        <Separator className="my-8" />
      )}

      {/* Otros Productos (diferentes categorías) */}
      {hasOtherProducts && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl lg:text-3xl font-headline font-bold">
              También Te Puede Interesar
            </h2>
            <p className="text-muted-foreground">
              Descubre más piezas únicas de nuestra colección
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {otherProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
