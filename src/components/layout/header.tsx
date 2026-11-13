'use client'

import { ChevronDown, Heart, Menu, Search, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
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
import { navLinks, productConfig } from '@/lib/config'
import { cn } from '@/lib/utils'

const ANNOUNCEMENTS = [
  'Envíos a todo Chile vía Starken • Seguimiento en tiempo real',
  'Entregas coordinadas en estaciones de Metro de Santiago',
  'Pago 100% protegido vía Flow.cl • Webpay, tarjetas y cuotas',
]

export function Header() {
  const router = useRouter()
  const [hasScrolled, setHasScrolled] = useState(false)
  const [announcementIndex, setAnnouncementIndex] = useState(0)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { items: wishlistItems } = useWishlist()

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
  }, [searchOpen])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      } else if (e.key === 'Escape') {
        setSearchOpen(false)
        setMegaMenuOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = searchQuery.trim()
    setSearchOpen(false)
    if (trimmed) {
      router.push(`/productos?q=${encodeURIComponent(trimmed)}`)
    } else {
      router.push('/productos')
    }
  }

  const linkClassName =
    'inline-flex items-center min-h-[44px] px-2 text-sm font-semibold tracking-wide text-zinc-200 transition-colors hover:text-[#F43F5E] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#F43F5E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B] rounded-sm'

  return (
    <header
      data-site-header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out',
        hasScrolled
          ? 'bg-[#09090B]/80 backdrop-blur-xl shadow-2xl border-b border-[#C4C9D2]/20'
          : 'bg-gradient-to-b from-[#09090B]/80 to-transparent backdrop-blur-[2px] border-b border-transparent'
      )}
    >
      {/* Barra de Anuncios Dinámica */}
      <div className="bg-[#121214]/95 border-b border-white/10 px-4 py-1.5 text-center">
        <p className="text-[11px] sm:text-xs font-medium tracking-wider text-[#C4C9D2] truncate">
          {ANNOUNCEMENTS[announcementIndex]}
        </p>
      </div>

      <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center shrink-0">
          <JoyasJPLogo
            variant="horizontal"
            color="plata"
            size="md"
            priority
            className="hover:scale-105"
          />
        </div>

        {/* Navegación Desktop + Mega-Menú de Colecciones */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Navegación principal">
          <div
            className="relative"
            onMouseEnter={() => setMegaMenuOpen(true)}
            onMouseLeave={() => setMegaMenuOpen(false)}
          >
            <button
              type="button"
              onClick={() => setMegaMenuOpen((prev) => !prev)}
              aria-expanded={megaMenuOpen}
              className={cn(linkClassName, 'gap-1')}
            >
              Colecciones
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  megaMenuOpen && 'rotate-180 text-[#F43F5E]'
                )}
              />
            </button>

            {megaMenuOpen && (
              <div className="absolute left-0 top-full pt-2 w-[540px] z-50">
                <div className="rounded-2xl border border-[#C4C9D2]/20 bg-[#09090B]/95 backdrop-blur-xl p-5 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F43F5E]">
                      Catálogo Completo
                    </span>
                    <Link
                      href="/productos"
                      onClick={() => setMegaMenuOpen(false)}
                      className="text-xs font-semibold text-[#C4C9D2] hover:text-white transition-colors"
                    >
                      Ver todo →
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {productConfig.categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/productos?categoria=${cat.id}`}
                        onClick={() => setMegaMenuOpen(false)}
                        className="group rounded-xl border border-white/5 bg-[#121214]/80 p-3 transition-all hover:border-[#D4113C]/60 hover:bg-[#121214]"
                      >
                        <span className="block text-sm font-bold text-white group-hover:text-[#F43F5E] transition-colors">
                          {cat.name}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-[#A1A1AA] line-clamp-1">
                          {cat.description}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClassName}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Acciones Derecha: Buscador, Favoritos, Carrito, Menú Móvil */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen((prev) => !prev)}
            className="h-11 w-11 rounded-full text-zinc-200 hover:text-white hover:bg-zinc-800/60 focus-visible:ring-2 focus-visible:ring-[#F43F5E]"
            aria-label="Buscar joyas en el catálogo"
          >
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>

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
                className="bg-[#09090B]/95 border-l-zinc-800 w-[300px] overflow-y-auto"
              >
                <div className="flex flex-col h-full p-6">
                  <div className="flex justify-center mb-6">
                    <JoyasJPLogo variant="horizontal" color="plata" size="sm" />
                  </div>
                  <nav className="flex flex-col gap-3 mt-4">
                    {navLinks.map((link) => (
                      <SheetClose asChild key={link.href}>
                        <Link href={link.href} className={linkClassName}>
                          {link.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F43F5E] mb-3">
                      Colecciones
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {productConfig.categories.map((cat) => (
                        <SheetClose asChild key={cat.id}>
                          <Link
                            href={`/productos?categoria=${cat.id}`}
                            className="min-h-[44px] flex items-center justify-between rounded-lg border border-white/5 bg-[#121214] px-3 py-2 text-sm font-medium text-[#C4C9D2] hover:text-white hover:border-[#D4113C]/50"
                          >
                            <span>{cat.name}</span>
                            <span className="text-xs text-[#F43F5E]">→</span>
                          </Link>
                        </SheetClose>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Buscador Predictivo Desplegable */}
      {searchOpen && (
        <div className="border-t border-white/10 bg-[#09090B]/95 backdrop-blur-xl px-4 py-4 shadow-2xl">
          <form onSubmit={handleSearchSubmit} className="container mx-auto max-w-3xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-4 w-4 text-[#A1A1AA]" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar cadenas, plata 925, dijes, relojes..."
                className="w-full min-h-[48px] rounded-xl border border-white/15 bg-[#121214] pl-11 pr-28 text-sm text-white placeholder:text-[#A1A1AA] focus:border-[#D4113C] focus:outline-none focus:ring-2 focus:ring-[#D4113C]/40"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-2 min-h-[36px] bg-[#D4113C] hover:bg-[#B30D33] text-white font-semibold px-4"
              >
                Buscar
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-[#A1A1AA]">
                Sugerencias:
              </span>
              {productConfig.categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/productos?categoria=${cat.id}`}
                  onClick={() => setSearchOpen(false)}
                  className="rounded-full border border-white/10 bg-[#121214] px-3 py-1 text-xs text-[#C4C9D2] hover:border-[#D4113C] hover:text-white transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </form>
        </div>
      )}
    </header>
  )
}
