import type { Product } from '@/lib/types'

export interface ProductBadge {
  text: string
  variant: 'soldout' | 'sale' | 'custom' | 'bundle'
  className: string
}

/**
 * Resuelve la única etiqueta visible en la tarjeta de producto del catálogo.
 * Sigue el estándar de alta joyería: máximo 1 etiqueta por tarjeta para evitar ruido visual.
 *
 * Prioridad:
 * 1. AGOTADO (respaldo si se accede directo con stock 0)
 * 2. Descuento (-X%) cuando discount_price < price (sobrio, sin animaciones)
 * 3. Etiqueta de curaduría manual (custom_label)
 * 4. SET EXCLUSIVO (is_bundle o categoría conjuntos)
 */
export function getProductBadge(
  product: Pick<Product, 'stock' | 'price' | 'discount_price' | 'custom_label' | 'is_bundle' | 'category'>
): ProductBadge | null {
  if (product.stock <= 0) {
    return {
      text: 'AGOTADO',
      variant: 'soldout',
      className: 'bg-zinc-950/90 text-zinc-200 border-zinc-700',
    }
  }

  if (product.discount_price && product.discount_price < product.price) {
    const discountPercent = Math.round(
      ((product.price - product.discount_price) / product.price) * 100
    )
    return {
      text: `-${discountPercent}%`,
      variant: 'sale',
      className: 'badge-premium badge-sale',
    }
  }

  const trimmedLabel = product.custom_label?.trim()
  if (trimmedLabel) {
    return {
      text: trimmedLabel.toUpperCase(),
      variant: 'custom',
      className: 'badge-premium badge-custom',
    }
  }

  if (product.is_bundle || product.category === 'conjuntos') {
    return {
      text: 'SET EXCLUSIVO',
      variant: 'bundle',
      className:
        'badge-premium bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-zinc-950 font-black tracking-wider shadow-[0_0_12px_rgba(245,158,11,0.45)] border border-amber-300/40 text-[9px] uppercase px-2 py-0.5 rounded-sm',
    }
  }

  return null
}
