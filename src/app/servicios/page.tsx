'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/lib/config'
import { useSiteConfig } from '@/hooks/use-site-config'
import { getVideoUrl, getImageUrl } from '@/lib/asset-version'


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
    <div className="relative min-h-screen bg-black">
      {/* Optimized Video Background */}
      <video
        src={getVideoUrl('mi-video2.mp4')}
        autoPlay
        loop
        muted
        playsInline
        preload="none"
        className="fixed top-0 left-0 w-full h-full object-cover z-0"
        aria-label="Video promocional de servicios para artistas"
      />
      {/* Overlay like homepage */}
      <div className="fixed top-0 left-0 w-full h-full bg-black/40 z-0" />

      <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-screen py-20">

          {/* Glassmorphism Container */}
          <div className="max-w-4xl mx-auto p-8 md:p-12 rounded-3xl bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl animate-fadeInUp w-full">

            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h1 className="text-5xl md:text-6xl font-headline font-bold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                {servicesPageContent.title.line1}
                <br />
                <span className="text-primary drop-shadow-md">
                  {servicesPageContent.title.line2}
                </span>
              </h1>

              <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-amber-200/50 to-transparent" />

              <div className="space-y-6 text-lg md:text-xl text-zinc-100 leading-relaxed font-body">
                {servicesPageContent.paragraphs(storeName).map((paragraph, index) => (
                  <p
                    key={index}
                    className="drop-shadow-sm"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="pt-8 flex flex-col sm:flex-row justify-center items-center gap-4 border-t border-white/5 mt-8">
                <Link
                  href={`https://wa.me/${(config?.whatsapp_number || '56974662174').replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="lg"
                    className="w-full sm:w-64 font-bold text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/20"
                  >
                    Contactar por WhatsApp
                  </Button>
                </Link>
                <Link
                  href={config?.instagram_url || siteConfig.links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-64 font-bold text-lg px-8 py-6 border-white/20 bg-white/5 text-white hover:bg-white hover:text-black transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                  >
                    Enviar DM a Instagram
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
