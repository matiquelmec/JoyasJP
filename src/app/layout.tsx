import React from 'react'
import type { Metadata, Viewport } from 'next'
import { Playfair_Display, PT_Sans, Bebas_Neue } from 'next/font/google'
import './globals.css'
import { ConditionalLayout } from '@/components/layout/conditional-layout'
import { Toaster } from '@/components/ui/sonner'
import { PreloaderProvider } from '@/components/providers/preloader-provider'
import { cn } from '@/lib/utils'
import { siteConfig } from '@/lib/config'
import { getSiteConfig } from '@/lib/server/get-site-config'
import { MaintenanceScreen } from '@/components/layout/maintenance-screen'
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

export async function generateMetadata(): Promise<Metadata> {
  let storeName = 'Joyas JP'
  let description = 'Descubre la exclusiva colección de Joyas JP: alta joyería urbana con diseños únicos, materiales premium y estilo auténtico.'

  try {
    // Fetch dynamic config from DB with built-in resilience
    const config = await getSiteConfig()

    if (config?.store_name) storeName = config.store_name
    if (config?.store_description) description = config.store_description
  } catch (error) {
    console.warn('[Metadata]: Usando valores por defecto debido a error en base de datos.')
  }

  const title = `${storeName} | Alta Joyería para la Escena Urbana`

  return {
    title: {
      default: title,
      template: `%s | ${storeName}`,
    },
    description: description,
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
    authors: [{ name: storeName }],
    creator: storeName,
    publisher: storeName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: '/',
      languages: {
        'es-CL': '/',
      },
    },
    manifest: '/manifest.webmanifest',
    openGraph: {
      type: 'website',
      locale: 'es_CL',
      url: '/',
      title: title,
      description: description,
      siteName: storeName,
      images: [
        {
          url: '/brand/joyasjp_og_image_1200x630.png',
          width: 1200,
          height: 630,
          alt: `${storeName} - Alta Joyería Urbana & Plata Fina 925`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: ['/brand/joyasjp_og_image_1200x630.png'],
      creator: '@joyasjp',
    },
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/brand/favicon_32.png', sizes: '32x32', type: 'image/png' },
        { url: '/brand/favicon_48.png', sizes: '48x48', type: 'image/png' },
        { url: '/favicon.png', sizes: '512x512', type: 'image/png' },
      ],
      shortcut: '/favicon.png',
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
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
}

// ⚡ DYNAMIC IMPORT para componente pesado
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const isMaintenance = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true'

  return (
    <html lang="es-CL" className="dark scroll-smooth">
      <head>

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        {/* Preconnect para Turso (base de datos activa) */}
        <link rel="preconnect" href="https://aws-us-east-1.turso.io" />
        <link rel="dns-prefetch" href="//aws-us-east-1.turso.io" />

        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />

        {/* 🔍 GOOGLE SEARCH FAVICON & BRAND LOGO SCHEMA (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'JewelryStore',
              'name': 'Joyas JP',
              'alternateName': 'Joyas JP Joyería Urbana',
              'url': siteConfig.url,
              'logo': `${siteConfig.url}/brand/joyasjp_avatar_redes_1080.jpg`,
              'image': `${siteConfig.url}/brand/joyasjp_avatar_redes_1080.jpg`,
              'description': 'Alta joyería urbana en Plata Fina de Milán 925 y Oro. Diseños macizos con despacho express en Punta Arenas y todo Chile.',
              'telephone': siteConfig.business.contact.phone,
              'priceRange': '$$',
              'address': {
                '@type': 'PostalAddress',
                'addressLocality': 'Punta Arenas',
                'addressRegion': 'Magallanes y de la Antártica Chilena',
                'addressCountry': 'CL'
              },
              'sameAs': [
                siteConfig.links.instagram,
                siteConfig.links.tiktok
              ]
            })
          }}
        />
        <meta name="build-version" content="20240523" />

        {/* ⚡ PRELOAD ASSETS CRÍTICOS */}

        {/* ⚡ Critical CSS optimizado */}
        <style dangerouslySetInnerHTML={{
          __html: `
            body{background:#09090B;color:#F4F4F5;font-display:swap}
            img:not([src]),img[src=""]{visibility:hidden!important;background:#09090B!important}
            img.lazyload,img.lazyloading{background:#09090B!important;color:transparent!important}
            img[data-placeholder],img[placeholder]{background:#09090B!important;opacity:0!important}
            header a,header nav a{text-decoration:none!important}
            header img,header picture{background:transparent!important;opacity:1!important}
            .sr-only{position:absolute!important;left:-9999px!important;width:1px!important;height:1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
            .animate-shimmer{animation:shimmer 1.5s infinite;background:linear-gradient(90deg,rgba(39,39,42,0.8) 25%,rgba(63,63,70,0.6) 50%,rgba(39,39,42,0.8) 75%);background-size:200% 100%}
            @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
          `
        }} />

        {/* DNS Prefetch para mejor performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />

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

          {isMaintenance ? (
            <MaintenanceScreen />
          ) : (
            /* Hydrate site config from server only when not in maintenance */
            <ConditionalLayout initialConfig={await getSiteConfig()}>
              {children}
            </ConditionalLayout>
          )}

          <Toaster />
        </PreloaderProvider>
      </body>
    </html>
  )
}
