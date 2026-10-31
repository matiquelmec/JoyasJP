import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { turso } from '@/lib/db/turso'
import { verifyAdminAuth } from '@/lib/admin-auth'
import {
  adminOrderUpdateSchema,
  normalizePaymentDetail,
  safeParseOrderItems,
} from '@/lib/validations/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function mapOrderRow(row: Record<string, unknown>) {
  return {
    ...row,
    total_amount: Number(row.total_amount || 0),
    discount_amount: Number(row.discount_amount || 0),
    items: safeParseOrderItems(row.items),
    payment_detail: normalizePaymentDetail(row.payment_detail),
  }
}

// GET - Obtener todos los pedidos con deserialización resiliente (Zero-Crash)
export async function GET(request: NextRequest) {
  if (!(await verifyAdminAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { rows } = await turso.execute('SELECT * FROM orders ORDER BY created_at DESC')
    const orders = rows.map((r) => mapOrderRow(r as Record<string, unknown>))

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch orders',
        details: (error as Error).message || String(error),
      },
      { status: 500 }
    )
  }
}

// PUT - Actualizar estado de un pedido con validación Zod v4
export async function PUT(request: NextRequest) {
  if (!(await verifyAdminAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rawBody = await request.json()
    const parsed = adminOrderUpdateSchema.safeParse(rawBody)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message || 'Datos de actualización de pedido inválidos',
          issues: parsed.error.issues,
        },
        { status: 400 }
      )
    }

    const orderId = (parsed.data.orderId || parsed.data.id)!
    const { status, trackingNumber } = parsed.data

    const { rows: existingRows } = await turso.execute({
      sql: 'SELECT * FROM orders WHERE id = ? LIMIT 1',
      args: [orderId],
    })

    if (existingRows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const existing = existingRows[0] as Record<string, unknown>
    let nextPaymentDetail = existing.payment_detail ? String(existing.payment_detail) : null

    if (trackingNumber) {
      const normalized = normalizePaymentDetail(existing.payment_detail)
      nextPaymentDetail = JSON.stringify({
        ...(normalized || { raw: '' }),
        trackingNumber,
      })
    }

    const nextPaymentStatus =
      ['paid', 'approved', 'delivered'].includes(status) &&
      (!existing.payment_status || existing.payment_status === 'pending')
        ? 'approved'
        : (existing.payment_status as string | null) || 'pending'

    await turso.execute({
      sql: `UPDATE orders
            SET status = ?,
                payment_status = ?,
                payment_detail = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
      args: [status, nextPaymentStatus, nextPaymentDetail, orderId],
    })

    const { rows } = await turso.execute({
      sql: 'SELECT * FROM orders WHERE id = ? LIMIT 1',
      args: [orderId],
    })

    try {
      revalidatePath('/admin')
      revalidatePath('/admin/pedidos')
    } catch {
      // Ignorar advertencias de revalidación fuera de contexto estático
    }

    const order = mapOrderRow(rows[0] as Record<string, unknown>)
    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      {
        error: 'Failed to update order',
        details: (error as Error).message || String(error),
      },
      { status: 500 }
    )
  }
}
