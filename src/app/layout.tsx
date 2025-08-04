'use client'

import type { Metadata, Viewport } from 'next'
import { Playfair_Display, PT_Sans } from 'next/font/google'
import './globals.css'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-headline',
  display: 'swap',
})

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Joyas JP | Alta Joyería para la Escena Urbana',
    template: '%s | Joyas JP',
  },
  description:
    'Descubre la exclusiva colección de Joyas JP: alta joyería urbana con diseños únicos, materiales premium y estilo auténtico. Perfecto para quienes buscan expresar su personalidad a través de piezas extraordinarias.',
  keywords: [
    'joyas urbanas Chile',
    'joyería premium',
    'diseños únicos',
    'estilo urbano',
    'alta joyería',
    'accesorios premium',
    'joyas artesanales',
    'Chile joyería',
  ],
  authors: [{ name: 'Joyas JP' }],
  creator: 'Joyas JP',
  publisher: 'Joyas JP',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  ),
  alternates: {
    canonical: '/',
    languages: {
      'es-CL': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    url: '/',
    title: 'Joyas JP | Alta Joyería para la Escena Urbana',
    description:
      'Descubre nuestra exclusiva colección de joyas urbanas con diseños únicos y calidad premium.',
    siteName: 'Joyas JP',
    images: [
      {
        url: '/assets/logo.png',
        width: 500,
        height: 500,
        alt: 'Joyas JP - Alta joyería urbana',
      },
    ],
  },
  icons: {
    icon: '/favicon.ico',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'shopping',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

// Schema.org structured data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Joyas JP',
  description:
    'Alta joyería para la escena urbana con diseños únicos y calidad premium',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/assets/logo.png`,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+56-9-1234-5678',
    contactType: 'customer service',
    areaServed: 'CL',
    availableLanguage: 'Spanish',
  },
  sameAs: ['https://instagram.com/joyasjp', 'https://tiktok.com/@joyasjp'],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'CL',
    addressLocality: 'Santiago',
  },
  foundingDate: '2024',
  founder: {
    '@type': 'Person',
    name: 'Joyas JP',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es-CL" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />

        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <link rel="apple-touch-icon" href="/favicon.ico?v=2" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Preloads optimizados */}
        <link
          rel="preload"
          href="/assets/logo.png"
          as="image"
          type="image/png"
        />
      </head>
      <body
        className={cn(
          'font-body antialiased bg-background text-foreground min-h-screen',
          playfairDisplay.variable,
          ptSans.variable
        )}
      >
        <a
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
          href="#main-content"
        >
          Saltar al contenido principal
        </a>

        <LayoutContent>{children}</LayoutContent>

        <Toaster />
      </body>
    </html>
  )
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  if (pathname?.startsWith('/admin')) {
    return <>{children}</>
  }

  return (
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
  )
}
