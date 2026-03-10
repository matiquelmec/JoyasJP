import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { siteConfig } from '@/lib/config'

export const dynamic = 'force-dynamic'

// GET - Obtener configuración pública (sin autenticación)
export async function GET(request: NextRequest) {
  try {
    // Get configuration from database bypassing RLS
    const { data, error } = await supabaseAdmin
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

    // Filter out sensitive data and mix with static config for legacy fields
    const publicConfig = {
      // Dynamic fields (from DB) with fallbacks
      store_name: data.store_name || siteConfig.name,
      store_email: data.store_email || siteConfig.business.contact.email,
      store_description: data.store_description || siteConfig.description,
      store_slogan: data.store_slogan || 'Atrévete a jugar',
      whatsapp_number: data.whatsapp_number || siteConfig.business.contact.phone,
      instagram_url: data.instagram_url || siteConfig.links.instagram,
      tiktok_url: data.tiktok_url || siteConfig.links.tiktok,

      // Static/Env fields
      shipping_cost: 3000,
      free_shipping_from: 50000,
      shipping_zones: siteConfig.ecommerce.shippingZones.join(', '),
      mercadopago_public_key: process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || ''
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