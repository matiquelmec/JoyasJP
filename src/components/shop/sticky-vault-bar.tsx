'use client'

import React from 'react'
import { ShoppingBag, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/use-cart'
import { useSiteConfig } from '@/hooks/use-site-config'
import { buildWhatsAppUrl } from '@/lib/utils'
import type { Product } from '@/lib/types'
import { toast } from 'sonner'

interface StickyVaultBarProps {
  product: Product
}

export function StickyVaultBar({ product }: StickyVaultBarProps) {
  const { addItem, openCart } = useCart()
  const { config } = useSiteConfig()
  const isOutOfStock = (product.stock ?? 0) <= 0

  const formatter = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  })

  const effectivePrice =
    product.discount_price && product.discount_price < product.price
      ? product.discount_price
      : product.price

  const handleAdd = () => {
    const added = addItem(product)
    if (!added) return

    toast.success('¡Agregado al carrito!', {
      description: `${product.name} listo para comprar.`,
      action: {
        label: 'Ver Carrito',
        onClick: () => openCart(),
      },
    })
  }

  const whatsappUrl = buildWhatsAppUrl(
    config?.whatsapp_number,
    isOutOfStock
      ? `Hola Joyas JP, vi que "${product.name}" figura agotado y me gustaría consultar por reposición o alternativas similares.`
      : `Hola Joyas JP, estoy viendo "${product.name}" (${formatter.format(effectivePrice)}) y me gustaría consultar por disponibilidad y medidas.`
  )

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#09090B]/95 border-t border-white/10 backdrop-blur-lg px-4 py-3 md:hidden shadow-[0_-10px_25px_rgba(0,0,0,0.8)]">
      <div className="container mx-auto flex items-center justify-between gap-3 max-w-md">
        {/* Precio & Disponibilidad */}
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] text-[#A1A1AA] uppercase tracking-widest font-semibold truncate">
            {isOutOfStock ? 'Pieza Agotada' : product.dimensions || 'Ley 925 / Acero'}
          </span>
          <span className="text-xl font-black text-white font-headline tracking-tight">
            {formatter.format(effectivePrice)}
          </span>
        </div>

        {/* Acciones de Compra y WhatsApp Concierge (+56 9 8299 0513) */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-xl bg-[#121214] border border-white/15 text-[#F43F5E] flex items-center justify-center hover:border-[#D4113C] hover:bg-[#1D0A10] transition-colors"
            aria-label="Consultar por WhatsApp (+56 9 8299 0513)"
          >
            <MessageCircle className="w-5 h-5" />
          </a>

          <Button
            onClick={handleAdd}
            disabled={isOutOfStock}
            size="lg"
            className="h-12 px-5 bg-primary text-black font-extrabold text-sm hover:bg-primary/90 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] disabled:opacity-50"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            {isOutOfStock ? 'Agotado' : 'Comprar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
