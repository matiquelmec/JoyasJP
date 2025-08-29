'use client'

import { track } from '@vercel/analytics'
import { Button, type ButtonProps } from '@/components/ui/button'
import { useCart } from '@/hooks/use-cart'
import { toast } from '@/hooks/use-toast'
import type { Product } from '@/lib/types'

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
    
    // Analytics tracking
    track('add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      product_category: product.category,
    })
    
    toast({
      title: 'Agregado al carrito',
      description: `${product.name} ha sido añadido a tu carrito.`,
      variant: 'default',
    })
  }

  return (
    <Button onClick={handleAddToCart} className={className} size={size}>
      Añadir al Carrito
    </Button>
  )
}
