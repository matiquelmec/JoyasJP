'use client'

import { useEffect, useState } from 'react'
import ProductCard from '@/components/shop/product-card'
import { Separator } from '@/components/ui/separator'
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
        setError(null)
        
        const response = await fetch(`/api/products/related?category=${encodeURIComponent(category)}&id=${encodeURIComponent(currentProductId)}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch related products from API')
        }

        const data = await response.json()
        
        setRelatedProducts(data.related || [])
        
        // Mezclar aleatoriamente los otros productos para variedad
        const shuffledOthers = (data.others || []).sort(() => Math.random() - 0.5)
        setOtherProducts(shuffledOthers)
        
      } catch (err: any) {
        console.warn('Falla al obtener productos relacionados de la API:', err)
        setError(err.message || 'Error al cargar productos relacionados')
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
