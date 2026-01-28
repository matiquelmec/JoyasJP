'use client'

import { ShoppingBag } from 'lucide-react'
import dynamic from 'next/dynamic'
import { memo, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetTrigger } from '@/components/ui/sheet'
import { useCart } from '@/hooks/use-cart'

// ⚡ Lazy load del contenido pesado del carrito
const CartSheetContent = dynamic(
  () => import('./cart-sheet-content'),
  {
    loading: () => <div className="w-[350px] sm:w-[540px] h-full bg-background" />,
    ssr: false
  }
)

export const CartPanel = memo(function CartPanel() {
  const { items, isOpen, openCart, closeCart } = useCart()

  // Solo necesitamos el contador para la vista inicial
  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => (open ? openCart() : closeCart())}
    >
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingBag className="h-6 w-6" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full h-5 w-5 text-xs flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>

      {/* Solo renderizamos/cargamos el contenido si el drawer está abierto */}
      {isOpen && <CartSheetContent />}
    </Sheet>
  )
})
