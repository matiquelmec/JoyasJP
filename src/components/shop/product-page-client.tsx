'use client'

import { useSiteConfig } from '@/hooks/use-site-config'
import { AddToCartButton } from '@/components/shop/add-to-cart-button'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/lib/types'

interface ProductPageClientProps {
  product: Product
}

export function ProductPageClient({ product }: ProductPageClientProps) {
  const { config } = useSiteConfig()

  const formatter = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  })

  const priceDisplay = {
    original: formatter.format(product.price),
    discount: product.discount_price ? formatter.format(product.discount_price) : null,
    hasDiscount: !!product.discount_price && product.discount_price < product.price
  }

  const freeShippingThreshold = config?.free_shipping_from || 50000

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

      {/* Description */}
      {product.description && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Descripción</h3>
          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>
        </div>
      )}

      {/* Product Details / Characteristics */}
      {(product.dimensions ||
        product.materials ||
        product.color ||
        product.detail) && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Detalles del Producto</h3>
            <ul className="list-disc list-inside text-muted-foreground">
              {product.dimensions && (
                <li>Dimensiones: {product.dimensions}</li>
              )}
              {product.materials && (
                <li>Materiales: {product.materials}</li>
              )}
              {product.color && <li>Color: {product.color}</li>}
              {product.detail && <li>Detalle: {product.detail}</li>}
            </ul>
          </div>
        )}

      {/* Actions */}
      <div className="space-y-4">
        <AddToCartButton product={product} className="w-full" size="lg" />
      </div>

    </>
  )
}