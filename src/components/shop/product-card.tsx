'use client'

import { Eye, Heart, ShoppingCart, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/use-cart'
import { toast } from 'sonner'
import { useWishlist } from '@/hooks/use-wishlist'
import type { Product } from '@/lib/types'
import { getProductBadge } from '@/lib/product-badges'
import { cn, normalizeColor, getLocalFallbackImage } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  priority?: boolean
  className?: string
}

const ProductCard = memo(function ProductCard({
  product,
  priority = false,
  className,
}: ProductCardProps) {
  const { addItem, openCart } = useCart()
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isItemInWishlist,
  } = useWishlist()
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [displayUrl, setDisplayUrl] = useState(product.imageUrl)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const isInWishlist = isClient && isItemInWishlist(product.id)
  const isOutOfStock = (product.stock ?? 0) <= 0

  const handleAddToCart = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (isAddingToCart || isOutOfStock) return

      setIsAddingToCart(true)

      try {
        const added = addItem(product)
        if (!added) return

        toast.custom(
          (t) => (
            <div className="flex w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg p-4 gap-4 items-center">
              <div className="relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden border border-zinc-100 shadow-sm">
                <Image
                  src={product.imageUrl || '/assets/logo.webp'}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 grid gap-1">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-none">
                  ¡Agregado al carrito!
                </p>
                <p className="text-xs text-zinc-500 truncate">{product.name}</p>
              </div>
              <Button
                size="sm"
                className="flex-shrink-0 text-xs h-9"
                onClick={() => {
                  openCart()
                  toast.dismiss(t)
                }}
              >
                Ver Carrito
              </Button>
            </div>
          ),
          { duration: 4000 }
        )
      } catch {
        toast.error('Error', {
          description: 'No se pudo agregar el producto. Intenta nuevamente.',
        })
      } finally {
        setIsAddingToCart(false)
      }
    },
    [addItem, product, isAddingToCart, isOutOfStock, openCart]
  )

  const handleWishlistClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      try {
        if (isInWishlist) {
          removeFromWishlist(product.id)
          toast.info('Eliminado de favoritos', {
            description: `${product.name} se eliminó de tus favoritos.`,
          })
        } else {
          addToWishlist(product)
          toast.success('¡Añadido a favoritos! ❤️', {
            description: `${product.name} se agregó a tus favoritos.`,
          })
        }
      } catch {
        toast.error('Error', {
          description: 'No se pudo actualizar favoritos.',
        })
      }
    },
    [isInWishlist, removeFromWishlist, addToWishlist, product]
  )

  const handleImageLoad = useCallback(() => {
    setImageLoading(false)
  }, [])

  const handleImageError = useCallback(() => {
    setImageLoading(false)
    const fallback = getLocalFallbackImage(product.id, product.category)
    if (displayUrl !== fallback) {
      setDisplayUrl(fallback)
    } else {
      setImageError(true)
    }
  }, [product.id, product.category, displayUrl])

  // Etiqueta única por tarjeta (estándar alta joyería)
  const badge = useMemo(() => getProductBadge(product), [product])

  const priceDisplay = useMemo(() => {
    const formatter = new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    })

    return {
      original: formatter.format(product.price),
      discount: product.discount_price ? formatter.format(product.discount_price) : null,
      hasDiscount: !!product.discount_price && product.discount_price < product.price,
    }
  }, [product.price, product.discount_price])

  return (
    <article
      className={cn(
        'group relative border rounded-lg overflow-hidden shadow-sm flex flex-col h-full bg-card product-card-hover',
        className
      )}
    >
      <Link
        href={`/productos/${product.slug || product.id}`}
        className="contents"
        aria-label={`Ver detalles de ${product.name}`}
      >
        <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800">
          {imageLoading && (
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 animate-shimmer" />
          )}

          {!imageError ? (
            <Image
              src={displayUrl}
              alt={`${product.name} - Joya urbana premium`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading={priority ? 'eager' : 'lazy'}
              className={cn(
                'object-cover product-image-hover transition-all duration-500',
                imageLoading ? 'scale-110 blur-sm opacity-0' : 'scale-100 blur-0 opacity-100',
                isOutOfStock && 'grayscale-[40%] opacity-85'
              )}
              onLoad={handleImageLoad}
              onError={handleImageError}
              priority={priority}
              quality={priority ? 80 : 60}
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-muted">
              <Sparkles className="w-12 h-12 text-muted-foreground" />
            </div>
          )}

          {/* Premium Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {badge && (
              <span
                className={cn(
                  'px-3 py-1 rounded-sm text-[10px] font-black tracking-tighter border shadow-xl',
                  badge.className
                )}
              >
                {badge.text}
              </span>
            )}
          </div>

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex flex-col items-center justify-center">
            <span className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-8 rounded-md px-3 text-xs opacity-0 group-hover:opacity-100 duration-300 backdrop-blur-sm">
              <Eye className="w-4 h-4 mr-2" />
              Ver Detalles
            </span>
          </div>
        </div>
      </Link>

      <div className="absolute top-2 right-2 z-20">
        <Button
          size="icon"
          variant="ghost"
          className="h-11 w-11 bg-white/90 hover:bg-white rounded-full shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-110"
          onClick={handleWishlistClick}
          aria-label={isInWishlist ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <Heart
            className={cn(
              'w-5 h-5 transition-colors duration-200',
              isInWishlist ? 'text-red-500 fill-current' : 'text-gray-600 hover:text-red-400'
            )}
          />
        </Button>
      </div>

      <div className="p-5 flex flex-col flex-grow space-y-4">
        <Link
          href={`/productos/${product.slug || product.id}`}
          className="inline-flex items-center min-h-[44px] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#F43F5E] rounded-sm"
        >
          <h3 className="text-[22px] sm:text-[28px] leading-[1.2] font-headline font-bold truncate cursor-pointer link-hover text-white">
            {product.name}
          </h3>
        </Link>

        <div className="text-sm">
          {product.materials ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#1D0A10] text-[#F43F5E] font-semibold capitalize border border-[#D4113C]/30 text-xs">
              {product.materials}
            </span>
          ) : product.color ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#1D0A10] text-[#F43F5E] font-semibold capitalize border border-[#D4113C]/30 text-xs">
              {normalizeColor(product.color) || product.color}
            </span>
          ) : product.dimensions ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#1D0A10] text-[#F43F5E] font-semibold border border-[#D4113C]/30 text-xs">
              {product.dimensions}
            </span>
          ) : product.code ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#1D0A10] text-[#F43F5E] font-semibold uppercase border border-[#D4113C]/30 text-xs">
              {product.code}
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#1D0A10] text-[#F43F5E] font-medium capitalize border border-[#D4113C]/30 text-xs">
              {product.category}
            </span>
          )}
        </div>

        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed font-body">
            {product.description}
          </p>
        )}

        <div className="flex-grow" />

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/30">
          <div className="flex flex-col">
            {priceDisplay.hasDiscount ? (
              <>
                <p className="text-xs text-[#A1A1AA] line-through decoration-[#F43F5E]/60">
                  {priceDisplay.original}
                </p>
                <p className="text-[24px] sm:text-[28px] leading-[1.1] font-bold text-[#F43F5E] font-headline tracking-tight">
                  {product.hasVariants ? 'Desde ' : ''}
                  {priceDisplay.discount}
                </p>
              </>
            ) : (
              <p className="text-[24px] sm:text-[28px] leading-[1.1] font-bold text-white font-headline tracking-tight">
                {product.hasVariants ? 'Desde ' : ''}
                {priceDisplay.original}
              </p>
            )}
          </div>

          <Button
            size="icon"
            onClick={handleAddToCart}
            disabled={isAddingToCart || isOutOfStock}
            className="h-11 w-11 bg-[#D4113C] hover:bg-[#B30D33] text-white transition-all duration-200 hover:scale-110 shadow-sm disabled:opacity-45 focus-visible:ring-[3px] focus-visible:ring-[#F43F5E]"
            aria-label={
              isOutOfStock ? `${product.name} agotado` : `Añadir ${product.name} al carrito`
            }
            title={isOutOfStock ? 'Producto agotado' : 'Añadir al carrito'}
          >
            {isAddingToCart ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingCart className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </article>
  )
})

export default ProductCard
