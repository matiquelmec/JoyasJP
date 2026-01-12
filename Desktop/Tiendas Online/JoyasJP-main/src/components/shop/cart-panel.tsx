'use client'

import { ShoppingBag, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { memo, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCart } from '@/hooks/use-cart'

export const CartPanel = memo(function CartPanel() {
  const {
    items,
    removeItem,
    updateItemQuantity,
    clearCart,
    isOpen,
    openCart,
    closeCart,
  } = useCart()

  // ⚡ Memoize expensive calculations
  const cartStats = useMemo(() => ({
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }), [items])

  const handleQuantityChange = useCallback((id: string, quantity: number) => {
    updateItemQuantity(id, quantity)
  }, [updateItemQuantity])

  const handleRemoveItem = useCallback((id: string) => {
    removeItem(id)
  }, [removeItem])

  const handleCheckout = () => {
    // Redirigir a la página de checkout en lugar de ir directo al pago
    closeCart()
    window.location.href = '/checkout'
  }

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => (open ? openCart() : closeCart())}
    >
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingBag className="h-6 w-6" />
          {cartStats.totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full h-5 w-5 text-xs flex items-center justify-center">
              {cartStats.totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Carrito de Compras ({cartStats.totalItems})</SheetTitle>
        </SheetHeader>
        {items.length > 0 ? (
          <>
            <ScrollArea className="flex-grow pr-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start gap-4">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="rounded-md bg-black"
                    />
                    <div className="flex-grow">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-primary">
                        ${item.price.toLocaleString('es-CL')}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.id,
                              parseInt(e.target.value)
                            )
                          }
                          className="w-16 p-1 rounded-md border bg-transparent text-center"
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <SheetFooter className="mt-4">
              <div className="w-full space-y-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Subtotal:</span>
                  <span>${cartStats.subtotal.toLocaleString('es-CL')}</span>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                >
                  Ir a Checkout
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearCart}
                >
                  Limpiar Carrito
                </Button>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center">
            <ShoppingBag className="w-16 h-16 text-muted-foreground" />
            <p className="mt-4 text-lg font-semibold">Tu carrito está vacío</p>
            <p className="text-sm text-muted-foreground">
              Agrega productos para empezar.
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
})
