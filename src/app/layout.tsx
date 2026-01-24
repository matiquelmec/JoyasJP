import React from 'react'
import type { Metadata, Viewport } from 'next'
import { Playfair_Display, PT_Sans, Bebas_Neue } from 'next/font/google'
import './globals.css'
import { ConditionalLayout } from '@/components/layout/conditional-layout'
import { Toaster } from '@/components/ui/sonner'
import { PreloaderProvider } from '@/components/providers/preloader-provider'
import { cn } from '@/lib/utils'
import { siteConfig } from '@/lib/config'
import '@/lib/env-validator' // 🛡️ Validador de variables de entorno

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-headline',
  display: 'swap',
  preload: true,
})

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
  display: 'swap',
  preload: true,
})

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bebas',
  display: 'swap',
  preload: true,
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
        url: '/assets/logo.webp',
        width: 450,
        height: 200,
        alt: 'Joyas JP - Alta joyería urbana',
      },
    ],
  },
  icons: {
    icon: '/assets/logo.webp',
    shortcut: '/assets/logo.webp',
    apple: '/assets/logo.webp',
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
    { media: '(prefers-color-scheme: light)', color: '#0a0a0a' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

// Schema.org structured data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Joyas JP',
  description:
    'Alta joyería para la escena urbana con diseños únicos y calidad premium',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/assets/logo.webp`,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+56-9-1234-5678',
    contactType: 'customer service',
    areaServed: 'CL',
    availableLanguage: 'Spanish',
  },
  sameAs: [siteConfig.links.instagram, siteConfig.links.tiktok],
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
        {/* Preconnect para Supabase */}
        <link rel="preconnect" href="https://lrsmmfpsbawznjpnllwr.supabase.co" />
        <link rel="dns-prefetch" href="https://lrsmmfpsbawznjpnllwr.supabase.co" />

        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <link rel="apple-touch-icon" href="/favicon.ico?v=2" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          defer
        />

        {/* Cache busting y optimización */}
        <meta name="build-version" content={`${Date.now()}`} />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />

        {/* ⚡ PRELOAD ASSETS CRÍTICOS */}

        {/* ⚡ Critical CSS optimizado */}
        <style dangerouslySetInnerHTML={{
          __html: `
            body{background:#0a0a0a;color:#fafafa;font-display:swap}
            img:not([src]),img[src=""]{visibility:hidden!important;background:#0a0a0a!important}
            img.lazyload,img.lazyloading{background:#0a0a0a!important;color:transparent!important}
            img[data-placeholder],img[placeholder]{background:#0a0a0a!important;opacity:0!important}
            header *{color:#fafafa!important}
            header a,header nav a{color:#fafafa!important;text-decoration:none!important;background:transparent!important}
            header .text-foreground{color:#fafafa!important}
            header img,header picture{background:transparent!important;opacity:1!important}
            header button,header [role="button"]{background:transparent!important;border:0!important;color:#fafafa!important}
            .sr-only{position:absolute!important;left:-9999px!important;width:1px!important;height:1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
            .animate-shimmer{animation:shimmer 1.5s infinite;background:linear-gradient(90deg,rgba(39,39,42,0.8) 25%,rgba(63,63,70,0.6) 50%,rgba(39,39,42,0.8) 75%);background-size:200% 100%}
            @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
          `
        }} />

        {/* DNS Prefetch para mejor performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//lrsmmfpsbawznjpnllwr.supabase.co" />

      </head>
      <body
        className={cn(
          'font-body antialiased bg-background text-foreground min-h-screen',
          playfairDisplay.variable,
          ptSans.variable,
          bebasNeue.variable
        )}
        data-loading="eager"
      >
        <PreloaderProvider>
          <a
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
            href="#main-content"
          >
            Saltar al contenido principal
          </a>

          <ConditionalLayout>{children}</ConditionalLayout>

          <Toaster />
        </PreloaderProvider>
      </body>
    </html>
  )
}
