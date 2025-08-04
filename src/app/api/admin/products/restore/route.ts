import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Verificar contraseña de admin
function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const expectedPassword = 'joyasjp2024'
  
  if (!authHeader || authHeader !== `Bearer ${expectedPassword}`) {
    return false
  }
  return true
}

// POST - Restaurar producto eliminado
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Admin client not available' }, { status: 500 })
  }

  try {
    const { productId, originalStock } = await request.json()
    
    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ 
        deleted_at: null,
        stock: originalStock || 0
      })
      .eq('id', productId)
      .select()

    if (error) throw error

    return NextResponse.json({ product: data[0] })
  } catch (error) {
    console.error('Error restoring product:', error)
    return NextResponse.json({ error: 'Failed to restore product' }, { status: 500 })
  }
}