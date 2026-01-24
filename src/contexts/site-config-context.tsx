'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { siteConfig as defaultConfig } from '@/lib/config'

interface SiteConfiguration {
  store_name: string
  store_email: string
  store_description: string
  shipping_cost: number
  free_shipping_from: number
  shipping_zones: string
  admin_email: string
  notify_new_orders: boolean
  notify_low_stock: boolean
  notify_new_customers: boolean
  mercadopago_public_key: string
  mercadopago_access_token: string
  instagram_url?: string
  tiktok_url?: string
  store_slogan?: string
  whatsapp_number?: string
}

interface SiteConfigContextType {
  config: SiteConfiguration
  loading: boolean
  refreshConfig: () => void
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined)

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfiguration>({
    store_name: defaultConfig.name,
    store_email: defaultConfig.business.contact.email,
    store_description: defaultConfig.description,
    shipping_cost: 3000,
    free_shipping_from: 50000,
    shipping_zones: defaultConfig.ecommerce.shippingZones.join(', '),
    admin_email: defaultConfig.business.contact.email,
    notify_new_orders: true,
    notify_low_stock: true,
    notify_new_customers: false,
    mercadopago_public_key: '',
    mercadopago_access_token: '',
    instagram_url: defaultConfig.links.instagram,
    tiktok_url: defaultConfig.links.tiktok,
    store_slogan: 'Atrévete a jugar',
    whatsapp_number: defaultConfig.business.contact.phone
  })
  const [loading, setLoading] = useState(true)

  const fetchConfig = async () => {
    try {
      setLoading(true)
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
    fetchConfig()

    // Verificar cambios cada 30 segundos (opcional, para auto-refresh)
    const interval = setInterval(() => {
      fetchConfig()
    }, 30000) // 30 segundos

    return () => clearInterval(interval)
  }, [])

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