'use client'

import { useSiteConfig } from '@/hooks/use-site-config'
import { AddToCartButton } from '@/components/shop/add-to-cart-button'
import type { Product } from '@/lib/types'

interface ProductPageClientProps {
  product: Product
}

export function ProductPageClient({ product }: ProductPageClientProps) {
  const { config } = useSiteConfig()

  const formattedPrice = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(product.price)

  const freeShippingThreshold = config?.free_shipping_from || 50000

  return (
    <>
      {/* Price */}
      <div className="space-y-2">
        <p className="text-4xl font-bold text-primary">
          {formattedPrice}
        </p>
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