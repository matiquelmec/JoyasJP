"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { navLinks } from '@/lib/config';
import { CartPanel } from '@/components/shop/cart-panel';

import { useWishlist } from '@/hooks/use-wishlist';
import { Heart } from 'lucide-react';

export function Header() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const { items: wishlistItems } = useWishlist();

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Estilo unificado para todos los enlaces de navegación
  const linkClassName = "text-sm font-medium text-muted-foreground transition-colors hover:text-primary";

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out bg-transparent backdrop-blur-sm",
      hasScrolled ? "shadow-lg" : "shadow-none"
    )}>
      <div className="container mx-auto flex h-36 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 🔧 LOGO PRINCIPAL CORREGIDO */}
        <Link href="/" className="flex items-center">
          <div className="relative h-28 w-28 md:h-32 md:w-32">
            <Image
              src="/assets/logo.webp"
              alt="Joyas JP Logo"
              fill
              sizes="(max-width: 768px) 112px, 128px"
              className="object-contain"
              priority
            />
          </div>
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
            <Button variant="ghost" size="lg" className="relative">
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
                <Button variant="ghost" size="lg">
                  <Menu className="h-7 w-7" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background/95 border-l-border/50 w-[280px]">
                <div className="flex flex-col h-full p-6">
                  <div className="flex justify-between items-center mb-8">
                    {/* 🔧 LOGO MÓVIL CORREGIDO */}
                    <Link href="/" className="flex items-center">
                      <div className="relative h-16 w-16 aspect-square">
                        <Image
                          src="/assets/logo.webp"
                          alt="Joyas JP Logo"
                          fill
                          sizes="64px"
                          className="object-contain"
                        />
                      </div>
                    </Link>
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
  );
}
