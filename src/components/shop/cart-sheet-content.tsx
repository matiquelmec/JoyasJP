'use client'

import { Trash2, ShoppingBag, Truck } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { useCart } from '@/hooks/use-cart'
import { useSiteConfig } from '@/hooks/use-site-config'
import { siteConfig } from '@/lib/config'

export default function CartSheetContent() {
    const router = useRouter()
    const { config } = useSiteConfig()
    const {
        items,
        removeItem,
        updateItemQuantity,
        clearCart,
        closeCart,
    } = useCart()

    const freeShippingThreshold = config?.free_shipping_from || siteConfig.ecommerce.freeShippingFrom

    // ⚡ Memoize expensive calculations using effective discount_price when applicable
    const cartStats = useMemo(() => {
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
        const subtotal = items.reduce((sum, item) => {
            const unitPrice =
                item.discount_price && item.discount_price > 0 && item.discount_price < item.price
                    ? item.discount_price
                    : item.price
            return sum + unitPrice * item.quantity
        }, 0)
        const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal)
        const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))
        return { totalItems, subtotal, remainingForFreeShipping, progressPercent }
    }, [items, freeShippingThreshold])

    const handleQuantityChange = useCallback((id: string, quantity: number) => {
        updateItemQuantity(id, quantity)
    }, [updateItemQuantity])

    const handleRemoveItem = useCallback((id: string) => {
        removeItem(id)
    }, [removeItem])

    const handleCheckout = () => {
        closeCart()
        router.push('/checkout')
    }

    return (
        <SheetContent className="flex flex-col">
            <SheetHeader>
                <SheetTitle>Carrito de Compras ({cartStats.totalItems})</SheetTitle>
            </SheetHeader>
            {items.length > 0 ? (
                <>
                    {/* Barra de progreso hacia Envío Gratis ($70.000) */}
                    <div className="my-3 rounded-xl border border-white/10 bg-[#121214] p-3.5 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-medium text-white">
                            <Truck className="w-4 h-4 text-[#F43F5E] shrink-0" />
                            {cartStats.remainingForFreeShipping > 0 ? (
                                <span>
                                    Te faltan{' '}
                                    <strong className="text-[#F43F5E]">
                                        ${cartStats.remainingForFreeShipping.toLocaleString('es-CL')}
                                    </strong>{' '}
                                    para <strong>Envío Gratis</strong> vía Starken
                                </span>
                            ) : (
                                <span className="text-[#C4C9D2] font-semibold">
                                    ¡Ganaste Envío Gratis vía Starken!
                                </span>
                            )}
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-[#D4113C] transition-all duration-500"
                                style={{ width: `${cartStats.progressPercent}%` }}
                            />
                        </div>
                    </div>

                    <ScrollArea className="flex-grow pr-4">
                        <div className="space-y-4">
                            {items.map((item) => {
                                const hasDiscount = Boolean(
                                    item.discount_price &&
                                        item.discount_price > 0 &&
                                        item.discount_price < item.price
                                )
                                const unitPrice = hasDiscount ? item.discount_price! : item.price
                                return (
                                <div key={item.id} className="flex items-start gap-4">
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.name}
                                        width={64}
                                        height={64}
                                        className="rounded-md bg-black object-cover"
                                    />
                                    <div className="flex-grow">
                                        <p className="font-semibold">{item.name}</p>
                                        {(item as any).dimensions && (
                                            <p className="text-xs text-muted-foreground">
                                                Dimensión: {(item as any).dimensions}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2">
                                            {hasDiscount && (
                                                <span className="text-xs text-[#A1A1AA] line-through">
                                                    ${item.price.toLocaleString('es-CL')}
                                                </span>
                                            )}
                                            <p className="text-sm font-bold text-[#F43F5E]">
                                                ${unitPrice.toLocaleString('es-CL')}
                                            </p>
                                        </div>
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
                                                className="w-16 h-9 p-1 rounded-md border bg-transparent text-center"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-11 w-11"
                                        aria-label={`Eliminar ${item.name}`}
                                        onClick={() => handleRemoveItem(item.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                                )
                            })}
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
    )
}
