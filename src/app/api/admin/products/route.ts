import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { supabase } from '@/lib/supabase-client'
import { generateUniqueSlug } from '@/lib/slug-utils'

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

// GET - Obtener todos los productos (incluyendo eliminados para admin)
export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { client, isAdmin } = getSupabaseClient()
    
    if (!client) {
      return NextResponse.json({ error: 'Database client not available' }, { status: 500 })
    }

    const { data, error } = await client
      .from('products')
      .select('*')
      .order('id', { ascending: false })

    if (error) throw error

    return NextResponse.json({ products: data })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch products',
      details: error.message 
    }, { status: 500 })
  }
}

// POST - Crear nuevo producto
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { client, isAdmin } = getSupabaseClient()
    
    if (!client) {
      return NextResponse.json({ error: 'Database client not available' }, { status: 500 })
    }

    const productData = await request.json()
    
    // Validate and ensure code exists and is uppercase
    if (!productData.code || typeof productData.code !== 'string') {
      return NextResponse.json({ 
        error: 'Código del producto requerido',
        message: 'El código del producto es obligatorio.'
      }, { status: 400 })
    }
    
    productData.code = productData.code.trim().toUpperCase()
    
    // Check for duplicate products (same code)
    const { data: existingProducts, error: searchError } = await client
      .from('products')
      .select('id, name, code')
      .eq('code', productData.code)
      .is('deleted_at', null) // Only check non-deleted products

    if (searchError) {
      console.warn('Error checking for duplicates:', searchError)
      // Continue with creation if duplicate check fails
    } else if (existingProducts && existingProducts.length > 0) {
      return NextResponse.json({ 
        error: 'Código duplicado',
        message: `Ya existe un producto con el código "${productData.code}". Los códigos de producto deben ser únicos.`,
        existingProduct: existingProducts[0]
      }, { status: 409 }) // 409 Conflict
    }

    // Generate unique slug from product name
    const { data: allProducts } = await client
      .from('products')
      .select('slug')
      .is('deleted_at', null)

    const existingSlugs = allProducts?.map(p => p.slug).filter(Boolean) || []
    const slug = generateUniqueSlug(productData.name, existingSlugs)

    // Add slug to product data
    const productWithSlug = {
      ...productData,
      slug
    }
    
    const { data, error } = await client
      .from('products')
      .insert([productWithSlug])
      .select()

    if (error) throw error

    return NextResponse.json({ product: data[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ 
      error: 'Failed to create product',
      details: error.message 
    }, { status: 500 })
  }
}

// PUT - Actualizar producto
export async function PUT(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { client, isAdmin } = getSupabaseClient()
    
    if (!client) {
      return NextResponse.json({ error: 'Database client not available' }, { status: 500 })
    }

    const { id, ...productData } = await request.json()
    
    const { data, error } = await client
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()

    if (error) throw error

    return NextResponse.json({ product: data[0] })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ 
      error: 'Failed to update product',
      details: error.message 
    }, { status: 500 })
  }
}

// DELETE - Eliminar producto (soft delete)
export async function DELETE(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { client, isAdmin } = getSupabaseClient()
    
    if (!client) {
      return NextResponse.json({ error: 'Database client not available' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('id')
    const permanent = searchParams.get('permanent') === 'true'

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    // First, check if deleted_at column exists by trying to query it
    let hasDeletedAtColumn = false
    try {
      await client
        .from('products')
        .select('deleted_at')
        .limit(1)
      hasDeletedAtColumn = true
    } catch (error) {
      hasDeletedAtColumn = false
    }

    let result
    if (permanent && isAdmin) {
      // Hard delete (permanent) - only with admin client
      result = await client
        .from('products')
        .delete()
        .eq('id', productId)
    } else if (hasDeletedAtColumn) {
      // Soft delete with deleted_at column
      result = await client
        .from('products')
        .update({ 
          deleted_at: new Date().toISOString(),
          stock: 0 
        })
        .eq('id', productId)
    } else {
      // Fallback: just set stock to 0 (hide product)
      result = await client
        .from('products')
        .update({ stock: 0 })
        .eq('id', productId)
    }

    if (result.error) throw result.error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ 
      error: 'Failed to delete product',
      details: error.message 
    }, { status: 500 })
  }
}