import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { supabase } from '@/lib/supabase-client'

// Verificar contraseña de admin (en producción usar JWT/session mejor)
function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const expectedPassword = 'joyasjp2024' // Debería coincidir con el panel
  
  if (!authHeader || authHeader !== `Bearer ${expectedPassword}`) {
    return false
  }
  return true
}

// Fallback client if admin client is not available
function getSupabaseClient() {
  if (supabaseAdmin) {
    return { client: supabaseAdmin, isAdmin: true }
  }
  
  console.warn('Admin client not available, falling back to regular client')
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

    if (error && error.code === 'PGRST116') {
      // No configuration exists, return defaults
      return NextResponse.json({ 
        configuration: {
          store_name: 'Joyas JP',
          store_email: 'contacto@joyasjp.com',
          store_description: 'Alta joyería para la escena urbana con diseños únicos y calidad premium.',
          shipping_cost: 3000,
          free_shipping_from: 50000,
          shipping_zones: 'Santiago, Valparaíso, Concepción, La Serena',
          admin_email: 'admin@joyasjp.com',
          notify_new_orders: true,
          notify_low_stock: true,
          notify_new_customers: false,
          mercadopago_public_key: '',
          mercadopago_access_token: ''
        }
      })
    }

    if (error) throw error

    return NextResponse.json({ configuration: data })
  } catch (error) {
    console.error('Error fetching configuration:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch configuration',
      details: error.message 
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
    const { data: existing } = await client
      .from('configuration')
      .select('id')
      .single()

    let result
    if (existing) {
      // Update existing configuration
      result = await client
        .from('configuration')
        .update(configData)
        .eq('id', existing.id)
        .select()
    } else {
      // Create new configuration
      result = await client
        .from('configuration')
        .insert([configData])
        .select()
    }

    if (result.error) throw result.error

    return NextResponse.json({ configuration: result.data[0] })
  } catch (error) {
    console.error('Error updating configuration:', error)
    return NextResponse.json({ 
      error: 'Failed to update configuration',
      details: error.message 
    }, { status: 500 })
  }
}