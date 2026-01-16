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
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem(product)

    // Analytics tracking removed (Vercel -> Netlify migration)

    toast.success('Agregado al carrito', {
      description: `${product.name} ha sido añadido a tu carrito.`,
      icon: (
        <div className="relative w-8 h-8 rounded-md overflow-hidden border border-zinc-200 shadow-sm mr-2">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
      ),
    })
  }

  return (
    <Button onClick={handleAddToCart} className={className} size={size}>
      Añadir al Carrito
    </Button>
  )
}
