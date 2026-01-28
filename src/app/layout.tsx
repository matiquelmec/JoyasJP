import React from 'react'
import type { Metadata, Viewport } from 'next'
import { Playfair_Display, PT_Sans, Bebas_Neue } from 'next/font/google'
import './globals.css'
import { ConditionalLayout } from '@/components/layout/conditional-layout'
import { Toaster } from '@/components/ui/sonner'
import { PreloaderProvider } from '@/components/providers/preloader-provider'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase-client'
import { siteConfig } from '@/lib/config'
import { getSiteConfig } from '@/lib/server/get-site-config'
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
    const { data: config } = await supabase
      .from('configuration')
      .select('*')
      .maybeSingle()

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
    openGraph: {
      type: 'website',
      locale: 'es_CL',
      url: '/',
      title: title,
      description: description,
      siteName: storeName,
      images: [
        {
          url: '/assets/logo.webp',
          width: 450,
          height: 200,
          alt: `${storeName} - Alta joyería urbana`,
        },
      ],
    },
    icons: {
      icon: '/favicon.png',
      shortcut: '/favicon.png',
      apple: '/favicon.png',
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

// Schema.org structured data generator
async function getJsonLd() {
  let storeName = 'Joyas JP'
  let storeEmail = siteConfig.business.contact.email
  let storePhone = siteConfig.business.contact.phone
  let description = 'Alta joyería para la escena urbana'
  let instagram = siteConfig.links.instagram
  let tiktok = siteConfig.links.tiktok

  try {
    const { data: config } = await supabase.from('configuration').select('*').maybeSingle()
    if (config) {
      if (config.store_name) storeName = config.store_name
      if (config.store_email) storeEmail = config.store_email
      if (config.whatsapp_number) storePhone = config.whatsapp_number
      if (config.store_description) description = config.store_description
      if (config.instagram_url) instagram = config.instagram_url
      if (config.tiktok_url) tiktok = config.tiktok_url
    }
  } catch (error) {
    console.warn('[JSON-LD]: Usando valores por defecto.')
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: storeName,
    description: description,
    url: siteConfig.url,
    logo: `${siteConfig.url}/assets/logo.webp`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: storePhone,
      contactType: 'customer service',
      areaServed: 'CL',
      availableLanguage: 'Spanish',
    },
    sameAs: [instagram, tiktok],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'CL',
      addressLocality: 'Santiago',
    },
    foundingDate: '2024',
    founder: {
      '@type': 'Person',
      name: storeName,
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = await getJsonLd()

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
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <>
            <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
            <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
          </>
        )}

        <link rel="icon" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          defer
        />

        {/* Cache busting y optimización determinística */}
        <meta name="build-version" content="20240523" />

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
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        )}

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

          {/* Hydrate site config from server */}
          <ConditionalLayout initialConfig={await getSiteConfig()}>
            {children}
          </ConditionalLayout>

          <Toaster />
        </PreloaderProvider>
      </body>
    </html>
  )
}
