'use client'

import { Heart, Menu, ShoppingBag, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CartPanel } from '@/components/dynamic-imports'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useWishlist } from '@/hooks/use-wishlist'
import { navLinks } from '@/lib/config'
import { useSiteConfig } from '@/hooks/use-site-config'
import { cn } from '@/lib/utils'

export function Header() {
  const [hasScrolled, setHasScrolled] = useState(false)
  const { items: wishlistItems } = useWishlist()
  const { config } = useSiteConfig()

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setHasScrolled(window.scrollY > 10)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Estilo unificado para todos los enlaces de navegación - con hover rojo elegante
  const linkClassName =
    'text-sm font-medium text-white hover:text-primary transition-all duration-300 hover:scale-105 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full'

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out bg-black/40 backdrop-blur-md border-b border-gray-800',
        hasScrolled ? 'bg-black/60 shadow-lg' : 'bg-black/40 shadow-none'
      )}
    >
      <div className="container mx-auto flex h-20 sm:h-24 md:h-32 lg:h-40 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center h-full py-2">
          <Image
            src="/assets/logo.webp"
            alt={`${config?.store_name || 'Joyas JP'} Logo`}
            width={180}
            height={180}
            priority
            sizes="(max-width: 640px) 80px, (max-width: 768px) 120px, (max-width: 1024px) 140px, 180px"
            className="h-16 sm:h-20 md:h-28 lg:h-36 w-auto transition-all duration-300"
          />
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClassName}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/favoritos">
            <Button 
              variant="ghost" 
              size="lg" 
              className="relative"
              aria-label={`Ver favoritos (${wishlistItems.length} productos)`}
            >
              <Heart className="h-7 w-7" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full h-6 w-6 text-sm flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Button>
          </Link>
          <CartPanel />

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="lg"
                  aria-label="Abrir menú de navegación"
                >
                  <Menu className="h-7 w-7" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="bg-background/95 border-l-border/50 w-[280px]"
              >
                <div className="flex flex-col h-full p-6">
                  <div className="flex justify-between items-center mb-8">
                    <Link href="/" className="flex items-center h-16">
                      <img
                        src="/assets/logo.webp"
                        alt="Joyas JP Logo"
                        className="h-12 w-auto"
                      />
                    </Link>
                    <SheetClose asChild>
                      <Button 
                        variant="ghost" 
                        size="lg"
                        aria-label="Cerrar menú"
                      >
                        <X className="h-7 w-7" />
                      </Button>
                    </SheetClose>
                  </div>
                  <nav className="flex flex-col gap-6 text-center">
                    {navLinks.map((link) => (
                      <SheetClose asChild key={link.href}>
                        <Link href={link.href} className={linkClassName}>
                          {link.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
