'use client'

import React from 'react'
import { ShoppingBag, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/use-cart'
import type { Product } from '@/lib/types'
import { toast } from 'sonner'

interface StickyVaultBarProps {
  product: Product
}

export function StickyVaultBar({ product }: StickyVaultBarProps) {
  const { addItem, openCart } = useCart()

  const formatter = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  })

  const effectivePrice = product.discount_price && product.discount_price < product.price
    ? product.discount_price
    : product.price

  const handleAdd = () => {
    addItem(product)
    toast.success('¡Agregado al carrito!', {
      description: `${product.name} listo para comprar.`,
      action: {
        label: 'Ver Carrito',
        onClick: () => openCart()
      }
    })
  }

  const whatsappMessage = encodeURIComponent(
    `Hola Joyas JP! 👋 Estoy viendo "${product.name}" (${formatter.format(effectivePrice)}) y me gustaría consultar por disponibilidad y medidas.`
  )
  const whatsappUrl = `https://wa.me/56982990513?text=${whatsappMessage}`

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-amber-500/20 backdrop-blur-lg px-4 py-3 md:hidden shadow-[0_-10px_25px_rgba(0,0,0,0.8)]">
      <div className="container mx-auto flex items-center justify-between gap-3 max-w-md">
        {/* Precio & Disponibilidad */}
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold truncate">
            {product.dimensions || 'Ley 925 / 18k'}
          </span>
          <span className="text-xl font-black text-amber-400 font-headline tracking-tight">
            {formatter.format(effectivePrice)}
          </span>
        </div>

        {/* Acciones de Compra y WhatsApp Concierge */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-xl bg-zinc-900 border border-emerald-500/30 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/10 transition-colors"
            aria-label="Consultar por WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
          </a>

          <Button
            onClick={handleAdd}
            size="lg"
            className="h-12 px-5 bg-primary text-black font-extrabold text-sm hover:bg-primary/90 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)]"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Comprar
          </Button>
        </div>
      </div>
    </div>
  )
}
