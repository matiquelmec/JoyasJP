'use client'

import { usePathname } from 'next/navigation'
import { useSiteConfig } from '@/hooks/use-site-config'
import { siteConfig } from '@/lib/config'
import { buildWhatsAppUrl, cn } from '@/lib/utils'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.78 14.02c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.13.11-1.82-.11-.42-.14-.96-.32-1.65-.62-2.9-1.25-4.8-4.18-4.94-4.37-.15-.19-1.18-1.57-1.18-3 0-1.43.75-2.13 1.02-2.42.27-.29.59-.36.79-.36h.57c.18 0 .43-.07.67.51.24.59.83 2.03.9 2.18.08.15.13.32.03.51-.1.19-.15.32-.29.49-.15.17-.31.38-.44.51-.15.15-.3.31-.13.61.17.29.77 1.27 1.65 2.06 1.13 1.01 2.08 1.32 2.38 1.47.29.15.46.12.63-.07.17-.19.74-.86.94-1.16.2-.29.4-.24.67-.15.27.1 1.72.81 2.01.96.29.15.49.22.56.34.07.12.07.7-.17 1.38Z" />
    </svg>
  )
}

function getContextualMessage(pathname: string): string {
  if (pathname.startsWith('/servicios')) {
    return 'Hola Joyas JP, quiero cotizar joyas para mi proyecto o producción.'
  }
  if (pathname.startsWith('/productos')) {
    return 'Hola Joyas JP, estoy viendo su catálogo y necesito asesoría con una pieza.'
  }
  if (pathname.startsWith('/contacto')) {
    return 'Hola Joyas JP, tengo una consulta y me gustaría hablar con un asesor.'
  }
  return 'Hola Joyas JP, tengo una consulta sobre sus joyas.'
}

export function WhatsAppConcierge() {
  const pathname = usePathname() || '/'
  const { config } = useSiteConfig()

  if (pathname.startsWith('/admin') || pathname.startsWith('/checkout')) {
    return null
  }

  // En fichas de producto móvil ya existe StickyVaultBar con acceso directo a WhatsApp
  const isProductDetail =
    pathname.startsWith('/productos/') && pathname !== '/productos/success'

  const whatsappHref = buildWhatsAppUrl(
    config?.whatsapp_number || siteConfig.business.contact.phone,
    getContextualMessage(pathname)
  )

  return (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Asesoría directa por WhatsApp"
      className={cn(
        'group fixed bottom-5 right-4 md:bottom-6 md:right-6 z-40 items-center gap-2.5 rounded-full border border-emerald-400/35 bg-[#09090B]/95 px-4 py-3 text-white shadow-[0_8px_30px_rgba(0,0,0,0.65)] backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-emerald-400 hover:shadow-[0_0_24px_rgba(16,185,129,0.35)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-emerald-400 min-h-[48px]',
        isProductDetail ? 'hidden md:inline-flex' : 'inline-flex'
      )}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#25D366] text-[#09090B]">
        <WhatsAppIcon className="h-4 w-4" />
      </span>
      <span className="hidden sm:inline text-xs font-bold tracking-wider uppercase text-zinc-100 group-hover:text-emerald-300 transition-colors">
        WhatsApp
      </span>
    </a>
  )
}
