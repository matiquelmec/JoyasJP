'use client'

import { Button } from '@/components/ui/button'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { useCart } from '@/hooks/use-cart'
import { Product } from '@/lib/types'
import { toast } from '@/hooks/use-toast'
import Link from 'next/link'
import { useWishlist } from '@/hooks/use-wishlist'
import { Heart, ShoppingCart, Eye, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  priority?: boolean
  className?: string
}

export default function ProductCardOptimized({
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
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const isInWishlist = isClient && isItemInWishlist(product.id)

  const handleAddToCart = async (e: React.MouseEvent) => {
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
  }

  const handleWishlistClick = (e: React.MouseEvent) => {
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
  }

  // Precio formateado
  const formattedPrice = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(product.price)

  return (
    <article
      className={cn(
        'group relative border rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full bg-card hover:-translate-y-1',
        className
      )}
    >
      <Link
        href={`/shop/${product.id}`}
        className="contents"
        aria-label={`Ver detalles de ${product.name}`}
      >
        <div className="relative w-full aspect-square overflow-hidden bg-muted/30">
          <OptimizedImage
            src={product.imageUrl}
            alt={`${product.name} - Joya urbana premium de Joyas JP`}
            width={400}
            height={400}
            className="object-cover transition-all duration-700 group-hover:scale-110"
            priority={priority}
          />

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

      <div className="p-4 flex flex-col flex-grow space-y-3">
        <Link href={`/shop/${product.id}`}>
          <h3 className="text-lg font-semibold truncate cursor-pointer hover:text-primary transition-colors duration-200">
            {product.name}
          </h3>
        </Link>

        <p className="text-sm text-muted-foreground capitalize flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          {product.category}
        </p>

        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        <div className="flex-grow" />

        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex flex-col">
            <p className="text-2xl font-bold text-primary">{formattedPrice}</p>
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
}
