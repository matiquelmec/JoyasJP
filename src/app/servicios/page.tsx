'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/lib/config'
import { useSiteConfig } from '@/hooks/use-site-config'
import { getVideoUrl } from '@/lib/asset-version'

const servicesPageContent = {
  title: {
    line1: 'Servicios Exclusivos',
    line2: 'para Artistas',
  },
  paragraphs: (storeName: string) => [
    `Tu música y tu imagen merecen brillar con la misma intensidad. En ${storeName}, entendemos que el estilo es una parte fundamental de tu identidad artística. Por eso, ofrecemos un servicio de venta y arriendo de nuestras piezas para tus videoclips, sesiones de fotos y eventos.`,
    'Accede a nuestra colección completa y elige las joyas que definan tu flow y eleven tu producción al siguiente nivel. Contáctanos por WhatsApp o Instagram para contarnos sobre tu proyecto y te prepararemos una propuesta a medida.',
  ],
}

export default function ServicesPage() {
  const { config } = useSiteConfig()
  const storeName = config?.store_name || 'Joyas JP'

  return (
    <div className="relative min-h-screen">
      {/* Crisp Video Background */}
      <video
        src={getVideoUrl('mi-video2.mp4')}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="fixed top-0 left-0 w-full h-full object-cover z-0"
        aria-label="Video promocional de servicios para artistas"
      />
      {/* Overlay like homepage */}
      <div className="fixed top-0 left-0 w-full h-full bg-black/40 z-0" />

      <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-headline font-bold text-white">
              {servicesPageContent.title.line1}
              <br />
              <span className="text-primary">
                {servicesPageContent.title.line2}
              </span>
            </h1>
            {servicesPageContent.paragraphs(storeName).map((paragraph, index) => (
              <p
                key={index}
                className="mt-6 text-lg text-white/90 leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                href="https://wa.me/56974662174"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="font-bold text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-transform duration-300 hover:scale-105 w-64"
                >
                  Contactar por WhatsApp
                </Button>
              </Link>
              <Link
                href={siteConfig.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="font-bold text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-black transition-transform duration-300 hover:scale-105 w-64"
                >
                  Enviar DM a Instagram
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
