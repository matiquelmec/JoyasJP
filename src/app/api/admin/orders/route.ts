import { NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/db/turso'
import { verifyAdminAuth } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET - Obtener todos los pedidos
export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { rows } = await turso.execute("SELECT * FROM orders ORDER BY created_at DESC")

    const orders = rows.map(r => ({
      ...r,
      items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items || [],
      payment_detail: typeof r.payment_detail === 'string' ? JSON.parse(r.payment_detail) : r.payment_detail || null
    }))

    return NextResponse.json({ orders: orders || [] })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({
      error: 'Failed to fetch orders',
      details: (error as Error).message || String(error)
    }, { status: 500 })
  }
}

// PUT - Actualizar estado de un pedido
export async function PUT(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { orderId, status } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json({
        error: 'Missing required fields: orderId and status'
      }, { status: 400 })
    }

    // Valid order statuses
    const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      }, { status: 400 })
    }

    await turso.execute({
      sql: "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      args: [status, orderId]
    })

    const { rows } = await turso.execute({
      sql: "SELECT * FROM orders WHERE id = ?",
      args: [orderId]
    })

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = {
      ...rows[0],
      items: typeof rows[0].items === 'string' ? JSON.parse(rows[0].items) : rows[0].items || [],
      payment_detail: typeof rows[0].payment_detail === 'string' ? JSON.parse(rows[0].payment_detail) : rows[0].payment_detail || null
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({
      error: 'Failed to update order',
      details: (error as Error).message || String(error)
    }, { status: 500 })
  }
}