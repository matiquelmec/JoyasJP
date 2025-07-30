'use client';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
// Performance components removed to reduce bundle size

import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { playfairDisplay, ptSans } from './fonts';

// Schema.org structured data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Joyas JP',
  description: 'Alta joyería para la escena urbana con diseños únicos y calidad premium',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/assets/logo.webp`,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+56-9-1234-5678',
    contactType: 'customer service',
    areaServed: 'CL',
    availableLanguage: 'Spanish',
  },
  sameAs: [
    'https://instagram.com/joyasjp',
    'https://tiktok.com/@joyasjp',
  ],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CL" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Performance preloading components removed for bundle optimization */}

        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/webp" sizes="any" href="/assets/logo.webp" />
        <link rel="manifest" href="/site.webmanifest" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Preload Service Worker para cache inmediato */}
        <link rel="preload" href="/sw.js" as="script" />

        {/* Preloads solo para recursos críticos usados inmediatamente */}
      </head>
      <body className={cn(
        "font-body antialiased bg-background text-foreground min-h-screen",
        playfairDisplay.variable,
        ptSans.variable
      )}>
        <a
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
          href="#main-content"
        >
          Saltar al contenido principal
        </a>

        <div className="relative flex min-h-screen flex-col">
          <Header />
          {/* 🔧 SOLUCIÓN: Agregamos pt-36 para compensar el header fijo de h-36 */}
          <main id="main-content" className="flex-1 pt-36">
            {children}
          </main>
          <Footer />
        </div>

        <Toaster />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}

function ServiceWorkerRegister() {
  const pathname = usePathname();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, [pathname]); // Re-register if pathname changes

  return null;
}
