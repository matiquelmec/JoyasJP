'use client'

import { useEffect, useState } from 'react'
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
}

export function useSiteConfig() {
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
    mercadopago_access_token: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch configuration from API (public endpoint)
    fetch('/api/configuration', {
      cache: 'no-store' // Evitar caché para obtener datos frescos
    })
      .then(res => res.json())
      .then(data => {
        if (data.configuration) {
          setConfig(data.configuration)
        }
      })
      .catch(error => {
        console.error('Error loading site configuration:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return { config, loading }
}