'use client'

import { usePathname } from 'next/navigation'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { SiteConfigProvider } from '@/contexts/site-config-context'
import { LoadingProvider, useLoading } from '@/contexts/loading-context'
import { BrandLoader } from '@/shared/components/loading/brand-loader'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isLoading, isInitialLoad } = useLoading()
  
  if (pathname?.startsWith('/admin')) {
    return <>{children}</>
  }

  return (
    <>
      <BrandLoader 
        isLoading={isLoading && isInitialLoad} 
        showSlogan={true}
      />
      
      <div className="relative flex min-h-screen flex-col">
        <ErrorBoundary>
          <Header />
        </ErrorBoundary>

        {/* 🔧 SOLUCIÓN: Padding responsivo para compensar header fijo */}
        <main id="main-content" className="flex-1 pt-36 md:pt-40">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>

        <ErrorBoundary>
          <Footer />
        </ErrorBoundary>
      </div>
    </>
  )
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
      <LoadingProvider>
        <LayoutContent>{children}</LayoutContent>
      </LoadingProvider>
    </SiteConfigProvider>
  )
}