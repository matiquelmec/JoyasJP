import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Direct client creation to avoid hanging issues
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables:', {
      url: !!supabaseUrl,
      key: !!supabaseServiceKey
    })
    return null
  }

  try {
    console.log('🔧 Creating fresh Supabase client...')
    const client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    console.log('✅ Supabase client created successfully')
    return client
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error)
    return null
  }
}

// Verificar contraseña de admin
function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const expectedPassword = 'joyasjp2024'
  
  if (!authHeader || authHeader !== `Bearer ${expectedPassword}`) {
    return false
  }
  return true
}

// POST - Crear nuevo producto
export async function POST(request: NextRequest) {
  console.log('🚀 Fixed API endpoint called')
  
  if (!verifyAdminAuth(request)) {
    console.log('❌ Unauthorized request')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Log environment status
    console.log('🔍 Environment check:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...'
    })

    const client = createSupabaseClient()
    
    if (!client) {
      console.error('❌ Database client not available')
      return NextResponse.json({ 
        error: 'Database client not available - Check environment variables',
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }, { status: 500 })
    }

    console.log('✅ Database client created successfully')

    const productData = await request.json()
    console.log('📦 Product data received:', JSON.stringify(productData, null, 2))
    
    // Use provided code as ID if available, otherwise generate UUID
    const productId = productData.code || crypto.randomUUID()
    console.log('🆔 Product ID:', productId)
    
    // Remove code from productData since it's not a database column
    const { code, ...productDataWithoutCode } = productData
    
    // Add the ID and remove fields that don't exist in database
    const { is_featured, is_deleted, ...validProductData } = productDataWithoutCode
    const productWithId = {
      id: productId,
      ...validProductData
    }
    
    console.log('💾 Inserting product:', productWithId)
    
    const { data, error } = await client
      .from('products')
      .insert([productWithId])
      .select()

    if (error) {
      console.error('❌ Database error:', error)
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      throw error
    }

    console.log('✅ Product created successfully:', data[0])
    return NextResponse.json({ product: data[0] }, { status: 201 })
  } catch (error: any) {
    console.error('💥 Error creating product:', error)
    console.error('💥 Full error object:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
      stack: error?.stack?.substring(0, 500)
    })
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
  console.log('🔧 Fixed API GET endpoint called')
  
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
      console.error('❌ Database query error:', error)
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
    console.error('💥 Test endpoint error:', error)
    return NextResponse.json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}