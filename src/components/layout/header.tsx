'use client'

import { Heart, Menu, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CartPanel } from '@/components/dynamic-imports'
import { Button } from '@/components/ui/button'
import { getSafeUrl } from '@/lib/safe-asset'
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
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Estilo unificado para todos los enlaces de navegación
  const linkClassName = "text-sm font-medium text-muted-foreground transition-colors hover:text-primary"

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out bg-transparent backdrop-blur-sm",
      hasScrolled ? "shadow-lg" : "shadow-none"
    )}>
      <div className="container mx-auto flex h-36 sm:h-40 md:h-44 lg:h-48 xl:h-52 items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src={getSafeUrl('logo.webp')}
            alt="Joyas JP Logo"
            width={208}
            height={208}
            priority
            sizes="(max-width: 640px) 128px, (max-width: 768px) 144px, (max-width: 1024px) 160px, 192px"
            className="h-32 w-32 sm:h-36 sm:w-36 md:h-40 md:w-40 lg:h-44 lg:w-44 xl:h-48 xl:w-48 object-contain"
            style={{ aspectRatio: '1/1' }}
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
                  <nav className="flex flex-col gap-6 text-center mt-12">
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
