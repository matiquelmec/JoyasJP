'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSiteConfig } from '@/hooks/use-site-config'
import { AddToCartButton } from '@/components/shop/add-to-cart-button'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ProductPageClientProps {
  product: Product
  variants?: Product[]
}

export function ProductPageClient({ product: initialProduct, variants = [] }: ProductPageClientProps) {
  const [selectedProduct, setSelectedProduct] = useState(initialProduct)
  const { config } = useSiteConfig()

  // Sincronizar si el producto inicial cambia (navegación entre productos)
  useEffect(() => {
    setSelectedProduct(initialProduct)
  }, [initialProduct])

  const formatter = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  })

  const priceDisplay = {
    original: formatter.format(selectedProduct.price),
    discount: selectedProduct.discount_price ? formatter.format(selectedProduct.discount_price) : null,
    hasDiscount: !!selectedProduct.discount_price && selectedProduct.discount_price < selectedProduct.price
  }

  const freeShippingThreshold = config?.free_shipping_from || 50000

  // Ordenar variantes por dimensiones si es posible
  const sortedVariants = useMemo(() => {
    if (variants.length === 0) return [selectedProduct]
    return [...variants].sort((a, b) => {
      const dimA = a.dimensions || ''
      const dimB = b.dimensions || ''
      return dimA.localeCompare(dimB, undefined, { numeric: true })
    })
  }, [variants, selectedProduct])

  return (
    <>
      {/* Price */}
      <div className="space-y-2">
        {priceDisplay.hasDiscount ? (
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground line-through decoration-red-500/50">
              {priceDisplay.original}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-black text-red-600 tracking-tighter">
                {priceDisplay.discount}
              </span>
              <Badge variant="destructive" className="animate-pulse">
                OFERTA ESPECIAL
              </Badge>
            </div>
          </div>
        ) : (
          <p className="text-4xl font-bold text-primary tracking-tighter">
            {priceDisplay.original}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          Precio incluye IVA. Envío gratis a partir de ${freeShippingThreshold.toLocaleString('es-CL')}
        </p>
      </div>

      {/* Variants / Dimensions Selector */}
      {sortedVariants.length > 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Seleccionar Dimensión</h3>
          <div className="flex flex-wrap gap-2">
            {sortedVariants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedProduct(variant)}
                className={cn(
                  "px-4 py-2 rounded-md border transition-all duration-200 text-sm font-medium",
                  selectedProduct.id === variant.id
                    ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                    : "bg-background border-input hover:border-primary/50 hover:bg-accent"
                )}
              >
                {variant.dimensions || 'Estándar'}
                {variant.price !== selectedProduct.price && (
                  <span className="block text-[10px] opacity-70">
                    {formatter.format(variant.price)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {selectedProduct.description && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Descripción</h3>
          <p className="text-muted-foreground leading-relaxed">
            {selectedProduct.description}
          </p>
        </div>
      )}

      {/* Product Details / Characteristics */}
      {(selectedProduct.dimensions ||
        selectedProduct.materials ||
        selectedProduct.color ||
        selectedProduct.detail) && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Detalles del Producto</h3>
            <ul className="list-disc list-inside text-muted-foreground">
              {selectedProduct.dimensions && (
                <li>Dimensiones: {selectedProduct.dimensions}</li>
              )}
              {selectedProduct.materials && (
                <li>Materiales: {selectedProduct.materials}</li>
              )}
              {selectedProduct.color && <li>Color: {selectedProduct.color}</li>}
              {selectedProduct.detail && <li>Detalle: {selectedProduct.detail}</li>}
            </ul>
          </div>
        )}

      {/* Actions */}
      <div className="space-y-4 pt-4">
        <AddToCartButton product={selectedProduct} className="w-full" size="lg" />
      </div>

    </>
  )
}