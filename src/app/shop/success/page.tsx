'use client'

import { CheckCircle2, Heart, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'
// Removed Vercel analytics tracking
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/use-cart'
import { useSiteConfig } from '@/hooks/use-site-config'

export default function SuccessPage() {
  const { clearCart } = useCart()
  const { config } = useSiteConfig()

  useEffect(() => {
    // Analytics tracking removed (Vercel -> Netlify migration)
    
    // Limpiar carrito después de compra exitosa
    clearCart()
  }, [clearCart])

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36 text-center">
      <div className="max-w-lg mx-auto">
        <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto mb-6" />
        <h1 className="text-4xl font-headline font-bold mb-4">
          ¡Pago Exitoso!
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Gracias por tu compra en <strong>{config?.store_name || 'Joyas JP'}</strong>. Hemos recibido tu
          pago exitosamente y estamos preparando tu pedido con mucho cuidado.
        </p>

        <div className="bg-muted/30 rounded-lg p-6 mb-8">
          <h3 className="font-semibold mb-2">¿Qué sigue?</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Recibirás una confirmación por email</li>
            <li>• Te contactaremos para coordinar la entrega</li>
            <li>• Tu pedido estará listo en 1-2 días hábiles</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/shop" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Seguir Comprando
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/favoritos" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Ver Favoritos
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
