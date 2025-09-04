'use client'

import { Instagram, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { siteConfig } from '@/lib/config'
import { useSiteConfig } from '@/hooks/use-site-config'

// Icono simple para TikTok
const TikTokIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    fill="currentColor"
    className="h-6 w-6"
  >
    <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3V0Z" />
  </svg>
)

const contactPageContent = {
  title: 'Ponte en Contacto',
  subtitle:
    'Estamos aquí para ayudarte. Si tienes preguntas, ideas para un proyecto o simplemente quieres saludarnos, no dudes en contactarnos por el canal que prefieras.',
  email: {
    title: 'Email',
    label: 'Para consultas y colaboraciones',
    address: 'empresa.joyasjp.cl@gmail.com',
  },
  phone: {
    title: 'WhatsApp',
    label: 'Atención directa y ventas',
    number: '+56 9 8299 0513',
    cleanNumber: '56982990513',
  },
  social: {
    title: 'Mensaje Directo',
    label: 'El flow es instantáneo. Escríbenos.',
  },
  showroom: {
    title: 'Showroom',
    location: 'Santiago, Chile',
    note: 'Visitas solo con cita previa.',
  },
}

export default function ContactPage() {
  const { config } = useSiteConfig()

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-headline font-bold">
            {contactPageContent.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {contactPageContent.subtitle}
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-8">
          <Card className="bg-card border-border/50 text-center">
            <CardHeader className="items-center">
              <CardTitle className="flex items-center gap-4">
                <Phone className="w-8 h-8 text-primary" />
                <span>{contactPageContent.phone.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {contactPageContent.phone.label}
              </p>
              <a
                href={`https://wa.me/${contactPageContent.phone.cleanNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent text-lg hover:underline"
              >
                {contactPageContent.phone.number}
              </a>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 text-center">
            <CardHeader className="items-center">
              <CardTitle className="flex items-center gap-4">
                <MessageCircle className="w-8 h-8 text-primary" />
                <span>{contactPageContent.social.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {contactPageContent.social.label}
              </p>
              <div className="flex items-center justify-center gap-6 mt-4">
                <a
                  href={siteConfig.links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-accent text-lg hover:underline"
                >
                  <Instagram className="w-6 h-6" />
                  <span>Instagram</span>
                </a>
                <a
                  href={siteConfig.links.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-accent text-lg hover:underline"
                >
                  <TikTokIcon />
                  <span>TikTok</span>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 text-center">
            <CardHeader className="items-center">
              <CardTitle className="flex items-center gap-4">
                <Mail className="w-8 h-8 text-primary" />
                <span>{contactPageContent.email.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {contactPageContent.email.label}
              </p>
              <a
                href={`mailto:${config?.store_email || contactPageContent.email.address}`}
                className="text-accent text-lg hover:underline"
              >
                {config?.store_email || contactPageContent.email.address}
              </a>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 text-center">
            <CardHeader className="items-center">
              <CardTitle className="flex items-center gap-4">
                <MapPin className="w-8 h-8 text-primary" />
                <span>{contactPageContent.showroom.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-accent text-lg">
                {contactPageContent.showroom.location}
              </p>
              <p className="text-muted-foreground">
                {contactPageContent.showroom.note}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}