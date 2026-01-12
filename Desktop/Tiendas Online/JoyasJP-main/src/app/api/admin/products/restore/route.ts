import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { verifyAdminAuth } from '@/lib/admin-auth'

// POST - Restaurar producto eliminado
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Admin client not available' }, { status: 500 })
  }

  try {
    const { client, isAdmin } = getSupabaseClient()

    if (!client) {
      return NextResponse.json({ error: 'Database client not available' }, { status: 500 })
    }

    const { productId, originalStock } = await request.json()

    // Check if deleted_at column exists
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

    let updateData: any = { stock: originalStock || 0 }
    if (hasDeletedAtColumn) {
      updateData.deleted_at = null
    }

    const { data, error } = await client
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select()

    if (error) throw error

    return NextResponse.json({ product: data[0] })
  } catch (error) {
    // console.error('Error restoring product:', error)
    return NextResponse.json({
      error: 'Failed to restore product',
      details: error.message
    }, { status: 500 })
  }

  function getSupabaseClient() {
    if (supabaseAdmin) {
      return { client: supabaseAdmin, isAdmin: true }
    }

    // console.warn('Admin client not available, falling back to regular client')
    return { client: require('@/lib/supabase-client').supabase, isAdmin: false }
  }
}