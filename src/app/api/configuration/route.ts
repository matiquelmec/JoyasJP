import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import { siteConfig } from '@/lib/config'

// GET - Obtener configuración pública (sin autenticación)
export async function GET(request: NextRequest) {
  try {
    // Get configuration from database
    const { data, error } = await supabase
      .from('configuration')
      .select('*')
      .single()

    if (error && (error.code === 'PGRST116' || error.message?.includes('relation "public.configuration" does not exist'))) {
      // Table doesn't exist or no configuration exists, return defaults from config.ts
      return NextResponse.json({ 
        configuration: {
          store_name: siteConfig.name,
          store_email: siteConfig.business.contact.email,
          store_description: siteConfig.description,
          shipping_cost: 3000,
          free_shipping_from: 50000,
          shipping_zones: siteConfig.ecommerce.shippingZones.join(', '),
          mercadopago_public_key: process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || ''
          // No incluimos admin_email ni access tokens por seguridad
        }
      })
    }

    if (error) throw error

    // Filter out sensitive data
    const publicConfig = {
      store_name: data.store_name,
      store_email: data.store_email,
      store_description: data.store_description,
      shipping_cost: data.shipping_cost,
      free_shipping_from: data.free_shipping_from,
      shipping_zones: data.shipping_zones,
      mercadopago_public_key: data.mercadopago_public_key
    }

    return NextResponse.json({ configuration: publicConfig })
  } catch (error) {
    // console.error('Error fetching configuration:', error)
    // En caso de error, devolver configuración por defecto
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