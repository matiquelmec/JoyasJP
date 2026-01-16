'use client'

// Removed Vercel analytics tracking
import { Button, type ButtonProps } from '@/components/ui/button'
import { useCart } from '@/hooks/use-cart'
import { toast } from 'sonner'
import type { Product } from '@/lib/types'
import Image from 'next/image'

interface AddToCartButtonProps extends ButtonProps {
  product: Product
}

export function AddToCartButton({
  product,
  className,
  size,
}: AddToCartButtonProps) {
  const { addItem, openCart } = useCart()

  const handleAddToCart = () => {
    addItem(product)

    // Analytics tracking removed (Vercel -> Netlify migration)

    toast.custom((t) => (
      <div className="flex w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg p-4 gap-4 items-center">
        <div className="relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden border border-zinc-100 shadow-sm">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0 grid gap-1">
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-none">
            ¡Agregado al carrito!
          </p>
          <p className="text-xs text-zinc-500 truncate">
            {product.name}
          </p>
        </div>
        <Button
          size="sm"
          variant="default"
          className="flex-shrink-0 text-xs h-8"
          onClick={() => {
            openCart()
            toast.dismiss(t)
          }}
        >
          Ver Carrito
        </Button>
      </div>
    ))
  }

  return (
    <Button onClick={handleAddToCart} className={className} size={size}>
      Añadir al Carrito
    </Button>
  )
}
