'use client'

import { usePathname } from 'next/navigation'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { SiteConfigProvider } from '@/contexts/site-config-context'
import { SiteConfiguration } from '@/lib/types'

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

  return (
    <SiteConfigProvider initialConfig={initialConfig}>
      <div className="relative flex min-h-screen flex-col">
        <ErrorBoundary>
          <Header />
        </ErrorBoundary>

        {/* 🔧 SOLUCIÓN: Padding responsivo optimizado para compensar header fijo */}
        <main id="main-content" className="flex-1 pt-36 sm:pt-44 md:pt-48 lg:pt-56">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>

        <ErrorBoundary>
          <Footer />
        </ErrorBoundary>
      </div>
    </SiteConfigProvider>
  )
}