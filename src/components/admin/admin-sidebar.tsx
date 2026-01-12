'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useSiteConfig } from '@/hooks/use-site-config'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Users,
  Settings,
  BookOpen,
  LogOut,
  Gauge,
  Wrench
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Catálogo de Joyas', href: '/admin/productos', icon: Package },
  { name: 'Pedidos y Ventas', href: '/admin/pedidos', icon: ShoppingCart },
  { name: 'Ajustes del Sitio', href: '/admin/configuracion', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { config } = useSiteConfig()

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-b from-background to-card border-r border-border px-6 pb-4 shadow-lg">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <Link href="/admin" className="flex items-center space-x-3 group">
              <div className="relative">
                <Image
                  src="/assets/logo.webp"
                  alt={`${config?.store_name || 'Joyas JP'} Logo`}
                  width={40}
                  height={40}
                  className="object-contain transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-primary/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {config?.store_name || 'Joyas JP'}
                </h1>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href ||
                      (item.href !== '/admin' && pathname.startsWith(item.href))

                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={cn(
                            'group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium transition-all duration-200 relative overflow-hidden',
                            isActive
                              ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg transform scale-[1.02]'
                              : 'text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 hover:transform hover:scale-[1.01]'
                          )}
                        >
                          {isActive && (
                            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/70 opacity-90" />
                          )}
                          <item.icon
                            className={cn(
                              'h-5 w-5 shrink-0 transition-all duration-200 relative z-10',
                              isActive
                                ? 'text-primary-foreground drop-shadow-sm'
                                : 'text-muted-foreground group-hover:text-primary group-hover:scale-110'
                            )}
                          />
                          <span className="relative z-10">{item.name}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>

              {/* Logout */}
              <li className="mt-auto">
                <button
                  className="group flex w-full gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 transition-all duration-200 text-muted-foreground hover:text-destructive hover:bg-destructive/5 border border-transparent hover:border-destructive/20"
                  onClick={() => {
                    // Implementar logout
                    window.location.href = '/'
                  }}
                >
                  <LogOut className="h-5 w-5 shrink-0 transition-all duration-200 group-hover:scale-110" />
                  Cerrar Sesión
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile Navigation - Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-gradient-to-r from-card to-background border-t border-border shadow-2xl">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navigation.slice(0, 5).map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center p-2 rounded-lg text-xs font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 mb-1',
                    isActive ? 'text-primary-foreground' : 'text-current'
                  )}
                />
                <span className="truncate">{item.name.split(' ')[0]}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}