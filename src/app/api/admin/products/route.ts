import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Verificar contraseña de admin (en producción usar JWT/session mejor)
function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const expectedPassword = 'joyasjp2024' // Debería coincidir con el panel
  
  if (!authHeader || authHeader !== `Bearer ${expectedPassword}`) {
    return false
  }
  return true
}

// GET - Obtener todos los productos (incluyendo eliminados para admin)
export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Admin client not available' }, { status: 500 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('id', { ascending: false })

    if (error) throw error

    return NextResponse.json({ products: data })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

// POST - Crear nuevo producto
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Admin client not available' }, { status: 500 })
  }

  try {
    const productData = await request.json()
    
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([productData])
      .select()

    if (error) throw error

    return NextResponse.json({ product: data[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

// PUT - Actualizar producto
export async function PUT(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Admin client not available' }, { status: 500 })
  }

  try {
    const { id, ...productData } = await request.json()
    
    const { data, error } = await supabaseAdmin
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()

    if (error) throw error

    return NextResponse.json({ product: data[0] })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

// DELETE - Eliminar producto (soft delete)
export async function DELETE(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Admin client not available' }, { status: 500 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('id')
    const permanent = searchParams.get('permanent') === 'true'

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    let result
    if (permanent) {
      // Hard delete (permanent)
      result = await supabaseAdmin
        .from('products')
        .delete()
        .eq('id', productId)
    } else {
      // Soft delete
      result = await supabaseAdmin
        .from('products')
        .update({ 
          deleted_at: new Date().toISOString(),
          stock: 0 
        })
        .eq('id', productId)
    }

    if (result.error) throw result.error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}