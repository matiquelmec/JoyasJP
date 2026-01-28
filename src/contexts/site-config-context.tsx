'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { siteConfig as defaultConfig } from '@/lib/config'

import { SiteConfiguration } from '@/lib/types'

interface SiteConfigContextType {
  config: SiteConfiguration
  loading: boolean
  refreshConfig: () => void
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined)

export function SiteConfigProvider({
  children,
  initialConfig
}: {
  children: ReactNode
  initialConfig?: SiteConfiguration
}) {
  const [config, setConfig] = useState<SiteConfiguration>(initialConfig || {
    store_name: defaultConfig.name,
    store_email: defaultConfig.business.contact.email,
    store_description: defaultConfig.description,
    shipping_cost: 3000,
    free_shipping_from: 50000,
    shipping_zones: [...defaultConfig.ecommerce.shippingZones],
    admin_email: defaultConfig.business.contact.email,
    notify_new_orders: true,
    notify_low_stock: true,
    mercadopago_public_key: '',
    mercadopago_access_token: '',
    instagram_url: defaultConfig.links.instagram,
    tiktok_url: defaultConfig.links.tiktok,
    store_slogan: 'Atrévete a jugar',
    whatsapp_number: defaultConfig.business.contact.phone
  })
  // Si tenemos initialConfig, no estamos cargando
  const [loading, setLoading] = useState(!initialConfig)

  const fetchConfig = async () => {
    try {
      // Si ya teníamos initialConfig, quizás queremos refrescar silenciosamente
      // pero para la primera carga, loading debe ser false si hay initialConfig
      if (!initialConfig) setLoading(true)

      const res = await fetch('/api/configuration', {
        cache: 'no-store', // Evitar caché para obtener datos frescos
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      const data = await res.json()
      if (data.configuration) {
        setConfig(data.configuration)
      }
    } catch (error) {
      // console.error('Error loading site configuration:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Si NO hay configuración inicial, buscarla inmediatamente
    if (!initialConfig) {
      fetchConfig()
    }

    // Verificar cambios cada 5 minutos (menos agresivo que 30s)
    const interval = setInterval(() => {
      fetchConfig()
    }, 1000 * 60 * 5)

    return () => clearInterval(interval)
  }, [initialConfig])

  const refreshConfig = () => {
    fetchConfig()
  }

  return (
    <SiteConfigContext.Provider value={{ config, loading, refreshConfig }}>
      {children}
    </SiteConfigContext.Provider>
  )
}

export function useSiteConfig() {
  const context = useContext(SiteConfigContext)
  if (context === undefined) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider')
  }
  return context
}