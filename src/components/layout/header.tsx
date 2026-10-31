'use client'

import { Heart, Menu, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CartPanel } from '@/components/dynamic-imports'
import { Button } from '@/components/ui/button'
import { JoyasJPLogo } from '@/components/ui/JoyasJPLogo'
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
  const linkClassName =
    "text-sm font-semibold tracking-wide text-zinc-300 transition-colors hover:text-[#F43F5E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F43F5E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B] rounded-sm py-1"

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
      hasScrolled
        ? "bg-[#09090B]/90 backdrop-blur-md shadow-xl border-b border-zinc-800/60"
        : "bg-transparent backdrop-blur-[2px] shadow-none"
    )}>
      <div className="container mx-auto flex h-20 md:h-24 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center shrink-0">
          <JoyasJPLogo
            variant="horizontal"
            color="plata"
            size="md"
            priority
            className="hover:scale-105"
          />
        </div>
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
              size="icon"
              className="relative h-11 w-11 rounded-full text-zinc-200 hover:text-white hover:bg-zinc-800/60 focus-visible:ring-2 focus-visible:ring-[#F43F5E]"
              aria-label={`Ver favoritos (${wishlistItems.length} productos)`}
            >
              <Heart className="h-5 w-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#D4113C] text-white rounded-full h-5 w-5 text-xs font-bold flex items-center justify-center shadow-md">
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
                  size="icon"
                  className="h-11 w-11 rounded-full text-zinc-200 hover:text-white hover:bg-zinc-800/60 focus-visible:ring-2 focus-visible:ring-[#F43F5E]"
                  aria-label="Abrir menú de navegación"
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="bg-[#09090B]/95 border-l-zinc-800 w-[290px]"
              >
                <div className="flex flex-col h-full p-6">
                  <div className="flex justify-center mb-6">
                    <JoyasJPLogo variant="horizontal" color="plata" size="sm" />
                  </div>
                  <nav className="flex flex-col gap-6 text-center mt-6">
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
