import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { supabase } from '@/lib/supabase-client'
import { verifyAdminAuth } from '@/lib/admin-auth'

// Fallback client if admin client is not available
function getSupabaseClient() {
  if (supabaseAdmin) {
    return { client: supabaseAdmin, isAdmin: true }
  }

  // console.warn('Admin client not available, falling back to regular client')
  return { client: supabase, isAdmin: false }
}

// GET - Obtener todos los pedidos
export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { client } = getSupabaseClient()

    if (!client) {
      return NextResponse.json({ error: 'Database client not available' }, { status: 500 })
    }

    // Obtener pedidos ordenados por fecha más reciente
    const { data: orders, error } = await client
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      // console.error('Error fetching orders:', error)
      return NextResponse.json({
        error: 'Failed to fetch orders',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({ orders: orders || [] })
  } catch (error) {
    // console.error('Error fetching orders:', error)
    return NextResponse.json({
      error: 'Failed to fetch orders',
      details: error.message
    }, { status: 500 })
  }
}

// PUT - Actualizar estado de un pedido
export async function PUT(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { client } = getSupabaseClient()

    if (!client) {
      return NextResponse.json({ error: 'Database client not available' }, { status: 500 })
    }

    const { orderId, status } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json({
        error: 'Missing required fields: orderId and status'
      }, { status: 400 })
    }

    // Valid order statuses
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      }, { status: 400 })
    }

    const { data, error } = await client
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      // console.error('Error updating order:', error)
      return NextResponse.json({
        error: 'Failed to update order',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({ order: data })
  } catch (error) {
    // console.error('Error updating order:', error)
    return NextResponse.json({
      error: 'Failed to update order',
      details: error.message
    }, { status: 500 })
  }
}