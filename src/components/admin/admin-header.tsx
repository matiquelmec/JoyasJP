'use client'

import { Bell, Menu, User, Settings, Home, LogOut, Package, ShoppingCart, Wrench, LayoutDashboard } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useSiteConfig } from '@/hooks/use-site-config'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Catálogo de Joyas', href: '/admin/productos', icon: Package },
  { name: 'Pedidos y Ventas', href: '/admin/pedidos', icon: ShoppingCart },
  { name: 'Ajustes del Sitio', href: '/admin/configuracion', icon: Settings },
]

export function AdminHeader() {
  const [hasScrolled, setHasScrolled] = useState(false)
  const { config } = useSiteConfig()
  const pathname = usePathname()

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

  const handleLogout = () => {
    localStorage.removeItem('joyasjp-admin-auth')
    window.location.href = '/'
  }

  // Estilo para enlaces de navegación - inspirado en el header principal
  const linkClassName =
    'text-sm font-medium text-white hover:text-primary transition-all duration-300 hover:scale-105 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full px-3 py-2'

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 lg:left-72 z-50 transition-all duration-300 ease-in-out bg-slate-950/80 backdrop-blur-md border-b border-white/5',
        hasScrolled ? 'shadow-xl' : 'shadow-lg'
      )}
    >
      <div className="flex h-16 sm:h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo - Redirige al dashboard */}
        <Link href="/admin" className="flex items-center h-full py-2 group">
          <div className="relative">
            <Image
              src="/assets/logo.webp"
              alt={`${config?.store_name || 'Joyas JP'} Admin`}
              width={120}
              height={120}
              priority
              sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 120px"
              className="h-12 sm:h-14 md:h-16 w-auto transition-all duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10"></div>
          </div>
        </Link>

        {/* Navegación Desktop */}
        <nav className="hidden lg:flex items-center gap-2">
          {navigation.map((link) => {
            const isActive = pathname === link.href ||
              (link.href !== '/admin' && pathname.startsWith(link.href))

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  linkClassName,
                  isActive && 'text-primary bg-primary/10 rounded-lg'
                )}
              >
                <link.icon className="inline-block w-4 h-4 mr-2" />
                {link.name}
              </Link>
            )
          })}
        </nav>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          {/* Notificaciones */}
          <Button
            variant={"ghost" as any}
            size={"sm" as any}
            className="relative text-white hover:text-primary hover:bg-white/10"
            aria-label="Notificaciones"
          >
            <Bell className="h-5 w-5" />
            <Badge
              variant={"destructive" as any}
              className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs animate-pulse"
            >
              •
            </Badge>
          </Button>

          {/* Menú de usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={"ghost" as any}
                size={"sm" as any}
                className="text-white hover:text-primary hover:bg-white/10 flex items-center gap-2"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-accent p-[1px]">
                  <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </div>
                <span className="hidden sm:inline text-sm font-medium">Admin</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Administrador</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/configuracion">
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/" target="_blank">
                  <Home className="mr-2 h-4 w-4" />
                  Ver Sitio Web
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Menú móvil */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant={"ghost" as any}
                  size={"sm" as any}
                  className="text-white hover:text-primary hover:bg-white/10"
                  aria-label="Abrir menú de navegación"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="bg-gradient-to-b from-slate-900 to-slate-800 border-l-slate-700 w-[280px]"
              >
                <div className="flex flex-col h-full p-6">
                  <div className="flex items-center mb-8">
                    <Image
                      src="/assets/logo.webp"
                      alt="Joyas JP Admin"
                      width={40}
                      height={40}
                      className="mr-3"
                    />
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        {config?.store_name || 'Joyas JP'}
                      </h2>
                      <p className="text-xs text-slate-300">Admin Panel</p>
                    </div>
                  </div>

                  <nav className="flex flex-col gap-2">
                    {navigation.map((link) => {
                      const isActive = pathname === link.href ||
                        (link.href !== '/admin' && pathname.startsWith(link.href))

                      return (
                        <SheetClose asChild key={link.href}>
                          <Link
                            href={link.href}
                            className={cn(
                              'flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-all duration-200',
                              isActive && 'bg-primary/20 text-primary'
                            )}
                          >
                            <link.icon className="h-5 w-5" />
                            {link.name}
                          </Link>
                        </SheetClose>
                      )
                    })}
                  </nav>

                  <div className="mt-auto pt-6 border-t border-slate-700">
                    <Button
                      variant={"ghost" as any}
                      className="w-full justify-start text-white hover:text-destructive hover:bg-destructive/10"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}