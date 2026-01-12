'use client'

import { usePathname } from 'next/navigation'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { SiteConfigProvider } from '@/contexts/site-config-context'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  if (pathname?.startsWith('/admin')) {
    return (
      <SiteConfigProvider>
        {children}
      </SiteConfigProvider>
    )
  }

  return (
    <SiteConfigProvider>
      <div className="relative flex min-h-screen flex-col">
        <ErrorBoundary>
          <Header />
        </ErrorBoundary>

        {/* 🔧 SOLUCIÓN: Padding responsivo optimizado para compensar header fijo */}
        <main id="main-content" className="flex-1 pt-20 sm:pt-24 md:pt-32 lg:pt-40">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>

        <ErrorBoundary>
          <Footer />
        </ErrorBoundary>
      </div>
    </SiteConfigProvider>
  )
}