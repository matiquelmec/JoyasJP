import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { supabase } from '@/lib/supabase-client'
import { siteConfig } from '@/lib/config'
import { verifyAdminAuth } from '@/lib/admin-auth'

// Fallback client if admin client is not available
function getSupabaseClient() {
  if (supabaseAdmin) {
    return { client: supabaseAdmin, isAdmin: true }
  }

  // console.warn('Admin client not available, falling back to regular client')
  return { client: supabase, isAdmin: false }
}

// GET - Obtener configuración
export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { client } = getSupabaseClient()

    if (!client) {
      return NextResponse.json({ error: 'Database client not available' }, { status: 500 })
    }

    // Get configuration from database
    const { data, error } = await client
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
          admin_email: siteConfig.business.contact.email,
          notify_new_orders: true,
          notify_low_stock: true,
          notify_new_customers: false,
          mercadopago_public_key: process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || '',
          mercadopago_access_token: process.env.MP_ACCESS_TOKEN || ''
        }
      })
    }

    if (error) throw error

    return NextResponse.json({ configuration: data })
  } catch (error) {
    // console.error('Error fetching configuration:', error)
    return NextResponse.json({
      error: 'Failed to fetch configuration',
      details: (error as Error).message || String(error)
    }, { status: 500 })
  }
}

// POST - Actualizar configuración
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { client } = getSupabaseClient()

    if (!client) {
      return NextResponse.json({ error: 'Database client not available' }, { status: 500 })
    }

    const configData = await request.json()

    // Check if configuration exists
    const { data: existing, error: checkError } = await client
      .from('configuration')
      .select('id')
      .single()


    let result
    if (existing && !checkError) {
      // Update existing configuration (always id = 1)
      result = await client
        .from('configuration')
        .update(configData)
        .eq('id', 1)
        .select()
    } else {
      // Create new configuration with id = 1
      result = await client
        .from('configuration')
        .insert([{ id: 1, ...configData }])
        .select()
    }

    if (result.error) throw result.error

    return NextResponse.json({ configuration: result.data[0] })
  } catch (error) {
    // console.error('Error updating configuration:', error)
    return NextResponse.json({
      error: 'Failed to update configuration',
      details: (error as Error).message || String(error)
    }, { status: 500 })
  }
}