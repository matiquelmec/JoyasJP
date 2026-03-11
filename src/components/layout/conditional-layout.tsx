'use client'

import { usePathname } from 'next/navigation'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { SiteConfigProvider } from '@/contexts/site-config-context'
import { SiteConfiguration } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ConditionalLayoutProps {
  children: React.ReactNode
  initialConfig?: SiteConfiguration
}

export function ConditionalLayout({ children, initialConfig }: ConditionalLayoutProps) {
  const pathname = usePathname()

  if (pathname?.startsWith('/admin')) {
    return (
      <SiteConfigProvider initialConfig={initialConfig}>
        {children}
      </SiteConfigProvider>
    )
  }

  // 🔧 SOLUCIÓN: Detectar páginas "Hero" (Home y Nosotros) que necesitan el header transparente
  const isHeroPage = pathname === '/' || pathname === '/nosotros'

  return (
    <SiteConfigProvider initialConfig={initialConfig}>
      <div className="relative flex min-h-screen flex-col">
        <ErrorBoundary>
          <Header />
        </ErrorBoundary>

        {/* 
            Si es Hero Page -> pt-0 (El contenido maneja su propio espacio/hero)
            Si NO es Hero Page -> Padding responsivo para compensar el header fijo
        */}
        <main
          id="main-content"
          className={cn(
            "flex-1",
            isHeroPage ? "pt-0" : "pt-36 sm:pt-44 md:pt-48 lg:pt-56"
          )}
        >
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>

        <ErrorBoundary>
          <Footer />
        </ErrorBoundary>
      </div>
    </SiteConfigProvider>
  )
}