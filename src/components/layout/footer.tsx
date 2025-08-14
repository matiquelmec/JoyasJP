'use client'

import { Instagram, Mail, Phone } from 'lucide-react'
import Link from 'next/link'
import { navLinks, siteConfig } from '@/lib/config'
import { useSiteConfig } from '@/hooks/use-site-config'

const TikTokIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    fill="currentColor"
    className="h-6 w-6"
  >
    <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3V0Z" />
  </svg>
)

export function Footer() {
  const { config } = useSiteConfig()
  
  const linkClassName =
    'text-sm text-muted-foreground transition-colors hover:text-primary'

  return (
    <footer className="bg-background border-t border-border/50 py-12 relative z-20">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4 sm:px-6 lg:px-8 text-center md:text-left">
        {/* Columna 1: Marca */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-xl font-bold font-headline">
            {config?.store_name || siteConfig.name}
          </h3>
          <p className="mt-2 text-sm text-primary">
            {config?.store_description || siteConfig.description}
          </p>
        </div>

        {/* Columna 2: Navegación */}
        <div className="flex flex-col items-center md:items-start">
          <h4 className="font-semibold uppercase tracking-wider text-foreground/90">
            Navegación
          </h4>
          <ul className="mt-4 space-y-2 text-sm">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClassName}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna 3: Contacto */}
        <div className="flex flex-col items-center md:items-start">
          <h4 className="font-semibold uppercase tracking-wider text-foreground/90">
            Contacto
          </h4>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Mail className="h-4 w-4" />
              <span>{config?.store_email || siteConfig.business.contact.email}</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Phone className="h-4 w-4" />
              <span>{siteConfig.business.contact.phone}</span>
            </div>
          </div>
        </div>

        {/* Columna 4: Redes Sociales */}
        <div className="flex flex-col items-center md:items-start">
          <h4 className="font-semibold uppercase tracking-wider text-foreground/90">
            Síguenos
          </h4>
          <div className="mt-4 flex space-x-4 justify-center md:justify-start">
            <Link
              href={siteConfig.links.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              <Instagram className="h-6 w-6" />
            </Link>
            <Link
              href={siteConfig.links.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              <TikTokIcon />
            </Link>
          </div>
        </div>
      </div>
      <div className="container mx-auto mt-8 border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} {config?.store_name || siteConfig.author}. Todos los
          derechos reservados.
        </p>
      </div>
    </footer>
  )
}