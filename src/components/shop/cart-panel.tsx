"use client";

import { useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { logUserAction } from '@/lib/logger';

export function CartPanel() {
  const { items, removeItem, updateItemQuantity, clearCart, isOpen, openCart, closeCart } = useCart();
  const router = useRouter();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    // item.price ya es un número, no necesita conversión.
    return sum + item.price * item.quantity;
  }, 0);

  const handleCheckout = () => {
    if (items.length === 0) return;
    
    logUserAction('cart_proceed_to_checkout', { 
      itemCount: items.length, 
      subtotal 
    });
    
    // Cerrar el panel del carrito
    closeCart();
    
    // Redirigir a la página de checkout
    router.push('/checkout');
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => open ? openCart() : closeCart()}>
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
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Carrito de Compras ({totalItems})</SheetTitle>
        </SheetHeader>
        {items.length > 0 ? (
          <>
            <ScrollArea className="flex-grow pr-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start gap-4">
                    <Image
                      src={item.imageUrl}
                      alt={`${item.name} - Miniatura en carrito`}
                      width={64}
                      height={64}
                      sizes="64px"
                      loading="lazy"
                      className="rounded-md bg-black object-cover"
                    />
                    <div className="flex-grow">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-primary">{item.price}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={item.quantity}
                          onChange={(e) => {
                            const newQuantity = parseInt(e.target.value);
                            if (newQuantity > 0 && newQuantity <= 99) {
                              updateItemQuantity(item.id, newQuantity);
                              logUserAction('cart_quantity_updated', {
                                productId: item.id,
                                oldQuantity: item.quantity,
                                newQuantity
                              });
                            }
                          }}
                          className="w-16 p-1 rounded-md border bg-transparent text-center"
                        />
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
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
                  <span>${subtotal.toLocaleString('es-CL')}</span>
                </div>
                <Button className="w-full" size="lg" onClick={handleCheckout}>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Ir a Checkout
                </Button>
                <Button variant="outline" className="w-full" onClick={clearCart}>
                  Limpiar Carrito
                </Button>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center">
            <ShoppingBag className="w-16 h-16 text-muted-foreground" />
            <p className="mt-4 text-lg font-semibold">Tu carrito está vacío</p>
            <p className="text-sm text-muted-foreground">Agrega productos para empezar.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
