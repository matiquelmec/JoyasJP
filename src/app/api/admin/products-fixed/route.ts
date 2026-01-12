import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminAuth } from '@/lib/admin-auth'

// Direct client creation to avoid hanging issues
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return null
  }

  try {
    const client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    return client
  } catch (error) {
    return null
  }
}

// POST - Crear nuevo producto
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const client = createSupabaseClient()

    if (!client) {
      return NextResponse.json({
        error: 'Database client not available - Check environment variables'
      }, { status: 500 })
    }

    const productData = await request.json()

    // Use provided code as ID if available, otherwise generate UUID
    const productId = productData.code || crypto.randomUUID()

    // Remove code from productData since it's not a database column
    const { code, ...productDataWithoutCode } = productData

    // Database uses imageUrl column
    const mappedData = {
      ...productDataWithoutCode,
      imageUrl: productDataWithoutCode.imageUrl || null
    }

    // Remove undefined fields BUT keep null for optional fields
    const cleanedData = Object.fromEntries(
      Object.entries(mappedData).filter(([_, v]) => v !== undefined && v !== '')
    )

    const productWithId = {
      id: productId,
      ...cleanedData
    }


    const { data, error } = await client
      .from('products')
      .insert([productWithId])
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json({ product: data[0] }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to create product',
      details: error?.message || 'Unknown error',
      code: error?.code,
      hint: error?.hint
    }, { status: 500 })
  }
}

// GET - Test endpoint
export async function GET() {

  try {
    const client = createSupabaseClient()

    if (!client) {
      return NextResponse.json({
        error: 'Database client not available',
        envVars: {
          url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        }
      }, { status: 500 })
    }

    // Try a simple query
    const { data, error } = await client
      .from('products')
      .select('id')
      .limit(1)

    if (error) {
      return NextResponse.json({
        error: 'Database query failed',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Database connection successful',
      hasData: data.length > 0,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}