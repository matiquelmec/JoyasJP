'use client'

import { Eye, Heart, ShoppingCart, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/use-cart'
import { toast } from '@/hooks/use-toast'
import { useWishlist } from '@/hooks/use-wishlist'
import type { Product } from '@/lib/types'
import { cn, normalizeColor } from '@/lib/utils'

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
  const { addItem } = useCart()
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isItemInWishlist,
  } = useWishlist()
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const isInWishlist = isClient && isItemInWishlist(product.id)

  const handleAddToCart = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (isAddingToCart) return

      setIsAddingToCart(true)

      try {
        addItem(product)
        toast({
          title: '¡Producto añadido! 🎉',
          description: `${product.name} se ha agregado a tu carrito.`,
          duration: 3000,
        })
      } catch (error) {
        toast({
          title: 'Error',
          description: 'No se pudo agregar el producto. Intenta nuevamente.',
          variant: 'destructive',
        })
      } finally {
        setIsAddingToCart(false)
      }
    },
    [addItem, product, isAddingToCart, toast]
  )

  const handleWishlistClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      try {
        if (isInWishlist) {
          removeFromWishlist(product.id)
          toast({
            title: 'Eliminado de favoritos',
            description: `${product.name} se eliminó de tus favoritos.`,
          })
        } else {
          addToWishlist(product)
          toast({
            title: '¡Añadido a favoritos! ❤️',
            description: `${product.name} se agregó a tus favoritos.`,
          })
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'No se pudo actualizar favoritos. Intenta nuevamente.',
          variant: 'destructive',
        })
      }
    },
    [isInWishlist, removeFromWishlist, addToWishlist, product, toast]
  )

  const handleImageLoad = useCallback(() => {
    setImageLoading(false)
  }, [])

  const handleImageError = useCallback(() => {
    setImageLoading(false)
    setImageError(true)
  }, [])

  // Precio formateado memoizado
  const formattedPrice = useMemo(
    () =>
      new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
      }).format(product.price),
    [product.price]
  )

  return (
    <article
      className={cn(
        'group relative border rounded-lg overflow-hidden shadow-sm flex flex-col h-full bg-card product-card-hover',
        className
      )}
    >
      <Link
        href={`/shop/${product.id}`}
        className="contents"
        aria-label={`Ver detalles de ${product.name}`}
      >
        <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800">
          {imageLoading && (
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 animate-shimmer" />
          )}

          {!imageError ? (
            <Image
              src={product.imageUrl}
              alt={`${product.name} - Joya urbana premium`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading={priority ? "eager" : "lazy"}
              className={cn(
                'object-cover product-image-hover transition-all duration-500',
                imageLoading ? 'scale-110 blur-sm opacity-0' : 'scale-100 blur-0 opacity-100'
              )}
              onLoad={handleImageLoad}
              onError={handleImageError}
              priority={priority}
              quality={priority ? 90 : 75}
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-muted">
              <Sparkles className="w-12 h-12 text-muted-foreground" />
            </div>
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <Button
              size="sm"
              variant="secondary"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Detalles
            </Button>
          </div>
        </div>
      </Link>

      <div className="absolute top-2 right-2 z-20">
        <Button
          size="icon"
          variant="ghost"
          className="bg-white/90 hover:bg-white rounded-full shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-110"
          onClick={handleWishlistClick}
          aria-label={
            isInWishlist ? 'Quitar de favoritos' : 'Añadir a favoritos'
          }
        >
          <Heart
            className={cn(
              'w-5 h-5 transition-colors duration-200',
              isInWishlist
                ? 'text-red-500 fill-current'
                : 'text-gray-600 hover:text-red-400'
            )}
          />
        </Button>
      </div>

      <div className="p-5 flex flex-col flex-grow space-y-4">
        <Link href={`/shop/${product.id}`}>
          <h3 className="text-xl font-headline font-semibold truncate cursor-pointer link-hover leading-tight">
            {product.name}
          </h3>
        </Link>

        {/* Etiqueta llamativa con características del producto */}
        <div className="text-sm">
          {product.materials ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold capitalize border border-primary/20">
              {product.materials}
            </span>
          ) : product.color ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 font-semibold capitalize border border-purple-500/20">
              {normalizeColor(product.color) || product.color}
            </span>
          ) : product.dimensions ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 font-semibold border border-blue-500/20">
              {product.dimensions}
            </span>
          ) : product.code ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 font-semibold uppercase border border-amber-500/20">
              {product.code}
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-500/10 text-gray-600 font-medium capitalize border border-gray-500/20">
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
            <p className="text-2xl font-bold text-primary font-headline">{formattedPrice}</p>
          </div>

          <Button
            size="icon"
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="transition-all duration-200 hover:scale-110 shadow-sm"
            aria-label={`Añadir ${product.name} al carrito`}
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
