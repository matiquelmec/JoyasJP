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
    'text-sm text-muted-foreground transition-all duration-300 hover:text-primary hover:pl-1'

  return (
    <footer className="bg-zinc-950/50 border-t border-primary/20 pt-20 pb-10 relative z-20 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center md:text-left">
          {/* Columna 1: Marca con Estilo Premium */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <div className="relative">
              <h3 className="text-4xl md:text-5xl font-bebas tracking-wide text-white uppercase group cursor-default">
                {config?.store_name || siteConfig.name}
                <span className="block h-1 w-12 bg-primary mt-1 transition-all duration-500 group-hover:w-full" />
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-zinc-400 max-w-xs font-headline font-medium uppercase tracking-widest">
              Atrévete a jugar
            </p>
          </div>

          {/* Columna 2: Navegación Elegante */}
          <div className="flex flex-col items-center md:items-start space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Colección
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClassName}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Contacto Directo */}
          <div className="flex flex-col items-center md:items-start space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Atención Personal
            </h4>
            <div className="space-y-4 text-sm text-zinc-400">
              <a
                href={`mailto:${config?.store_email || siteConfig.business.contact.email}`}
                className="flex items-center justify-center md:justify-start gap-3 group transition-colors hover:text-white"
              >
                <div className="p-2 rounded-full bg-zinc-900 group-hover:bg-primary/20 transition-colors">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <span>{config?.store_email || siteConfig.business.contact.email}</span>
              </a>
              <a
                href={`tel:${siteConfig.business.contact.phone.replace(/\s/g, '')}`}
                className="flex items-center justify-center md:justify-start gap-3 group transition-colors hover:text-white"
              >
                <div className="p-2 rounded-full bg-zinc-900 group-hover:bg-primary/20 transition-colors">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <span>{siteConfig.business.contact.phone}</span>
              </a>
            </div>
          </div>

          {/* Columna 4: Presencia Social */}
          <div className="flex flex-col items-center md:items-start space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Comunidad
            </h4>
            <div className="flex space-x-4">
              <Link
                href={siteConfig.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-primary/20 transition-all duration-300 hover:scale-110 shadow-lg"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" />
              </Link>
              <Link
                href={siteConfig.links.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-primary/20 transition-all duration-300 hover:scale-110 shadow-lg"
                aria-label="TikTok"
              >
                <TikTokIcon />
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright y Créditos */}
        <div className="mt-20 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-zinc-600">
          <p>
            &copy; {new Date().getFullYear()} {config?.store_name || siteConfig.author} &bull; Joyería de Autor
          </p>
          <div className="flex gap-6">
            <Link href="/privacidad" className="hover:text-primary transition-colors">Privacidad</Link>
            <Link href="/terminos" className="hover:text-primary transition-colors">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}