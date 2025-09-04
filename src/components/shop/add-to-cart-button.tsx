'use client'

// Removed Vercel analytics tracking
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
    
    // Analytics tracking removed (Vercel -> Netlify migration)
    
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
