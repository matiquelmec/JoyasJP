import { NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/db/turso'
import { siteConfig } from '@/lib/config'

export const dynamic = 'force-dynamic'

// GET - Obtener configuración pública (sin autenticación)
export async function GET(request: NextRequest) {
  try {
    const { rows } = await turso.execute("SELECT * FROM configuration LIMIT 1")

    if (!rows || rows.length === 0) {
      // Si la tabla no tiene filas, devolver valores predeterminados
      return NextResponse.json({
        configuration: {
          store_name: siteConfig.name,
          store_email: siteConfig.business.contact.email,
          store_description: siteConfig.description,
          shipping_cost: 3000,
          free_shipping_from: 50000,
          shipping_zones: siteConfig.ecommerce.shippingZones.join(', '),
          mercadopago_public_key: process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || ''
        }
      })
    }

    const data = rows[0] as any

    const publicConfig = {
      store_name: data.store_name || siteConfig.name,
      store_email: data.store_email || siteConfig.business.contact.email,
      store_description: data.store_description || siteConfig.description,
      store_slogan: data.store_slogan || 'Atrévete a jugar',
      whatsapp_number: data.whatsapp_number || siteConfig.business.contact.phone,
      instagram_url: data.instagram_url || siteConfig.links.instagram,
      tiktok_url: data.tiktok_url || siteConfig.links.tiktok,
      shipping_cost: 3000,
      free_shipping_from: 50000,
      shipping_zones: siteConfig.ecommerce.shippingZones.join(', '),
      mercadopago_public_key: process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || ''
    }

    return NextResponse.json({ configuration: publicConfig })
  } catch (error) {
    console.error('Error fetching configuration:', error)
    return NextResponse.json({
      configuration: {
        store_name: siteConfig.name,
        store_email: siteConfig.business.contact.email,
        store_description: siteConfig.description,
        shipping_cost: 3000,
        free_shipping_from: 50000,
        shipping_zones: siteConfig.ecommerce.shippingZones.join(', '),
        mercadopago_public_key: process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || ''
      }
    })
  }
}