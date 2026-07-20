import { NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/db/turso'
import { verifyAdminAuth } from '@/lib/admin-auth'

// ✅ Siempre datos en vivo en el panel admin
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET - Obtener todos los cupones con sus estadísticas de ventas
export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 1. Obtener todos los cupones
    const { rows: coupons } = await turso.execute("SELECT * FROM coupons ORDER BY created_at DESC")

    // 2. Obtener estadísticas de ventas por cada cupón (solo compras aprobadas)
    const { rows: salesStats } = await turso.execute(`
      SELECT coupon_code, COUNT(id) as total_orders, SUM(total_amount) as total_sales 
      FROM orders 
      WHERE (payment_status = 'approved' OR payment_status = 'completed' OR status = 'approved') 
        AND coupon_code IS NOT NULL 
      GROUP BY coupon_code
    `)

    const salesMap = new Map<string, { orders: number, sales: number }>()
    salesStats.forEach(row => {
      salesMap.set(String(row.coupon_code).toUpperCase(), {
        orders: Number(row.total_orders || 0),
        sales: Number(row.total_sales || 0)
      })
    })

    const mappedCoupons = coupons.map(c => {
      const codeUpper = String(c.code).toUpperCase()
      const stats = salesMap.get(codeUpper) || { orders: 0, sales: 0 }

      return {
        code: c.code,
        discount_type: c.discount_type,
        discount_value: Number(c.discount_value),
        min_cart_amount: Number(c.min_cart_amount || 0),
        usage_limit: c.usage_limit !== null ? Number(c.usage_limit) : null,
        usage_count: Number(c.usage_count || 0),
        expires_at: c.expires_at || null,
        is_active: Boolean(c.is_active === 1 || String(c.is_active) === 'true'),
        affiliate_name: c.affiliate_name || null,
        created_at: c.created_at,
        total_orders: stats.orders,
        total_sales: stats.sales
      }
    })

    return NextResponse.json({ coupons: mappedCoupons })
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return NextResponse.json({
      error: 'Failed to fetch coupons',
      details: (error as Error).message || String(error)
    }, { status: 500 })
  }
}

// POST - Crear un nuevo cupón
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { code, discount_type, discount_value, min_cart_amount, usage_limit, expires_at, is_active, affiliate_name } = body

    if (!code || !discount_type || discount_value === undefined) {
      return NextResponse.json({ error: 'Missing required coupon data' }, { status: 400 })
    }

    const codeUpper = code.trim().toUpperCase()

    // Verificar si el código ya existe
    const { rows } = await turso.execute({
      sql: "SELECT code FROM coupons WHERE code = ?",
      args: [codeUpper]
    })

    if (rows.length > 0) {
      return NextResponse.json({ error: 'Ya existe un cupón con este código' }, { status: 409 })
    }

    await turso.execute({
      sql: `INSERT INTO coupons (
        code, discount_type, discount_value, min_cart_amount, usage_limit, expires_at, is_active, affiliate_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        codeUpper,
        discount_type,
        Number(discount_value),
        Number(min_cart_amount || 0),
        usage_limit !== undefined && usage_limit !== '' ? Number(usage_limit) : null,
        expires_at || null,
        is_active ? 1 : 0,
        affiliate_name || null
      ]
    })

    return NextResponse.json({ success: true, message: 'Cupón creado correctamente' }, { status: 201 })
  } catch (error) {
    console.error('Error creating coupon:', error)
    return NextResponse.json({
      error: 'Failed to create coupon',
      details: (error as Error).message || String(error)
    }, { status: 500 })
  }
}

// PUT - Actualizar un cupón
export async function PUT(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { code, discount_type, discount_value, min_cart_amount, usage_limit, expires_at, is_active, affiliate_name } = body

    if (!code) {
      return NextResponse.json({ error: 'Missing coupon code' }, { status: 400 })
    }

    const codeUpper = code.trim().toUpperCase()

    await turso.execute({
      sql: "UPDATE coupons SET discount_type = ?, discount_value = ?, min_cart_amount = ?, usage_limit = ?, expires_at = ?, is_active = ?, affiliate_name = ? WHERE code = ?",
      args: [
        discount_type,
        Number(discount_value),
        Number(min_cart_amount || 0),
        usage_limit !== undefined && usage_limit !== '' && usage_limit !== null ? Number(usage_limit) : null,
        expires_at || null,
        is_active ? 1 : 0,
        affiliate_name || null,
        codeUpper
      ]
    })

    return NextResponse.json({ success: true, message: 'Cupón actualizado correctamente' })
  } catch (error) {
    console.error('Error updating coupon:', error)
    return NextResponse.json({
      error: 'Failed to update coupon',
      details: (error as Error).message || String(error)
    }, { status: 500 })
  }
}

// DELETE - Eliminar un cupón de forma permanente
export async function DELETE(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json({ error: 'Missing coupon code' }, { status: 400 })
    }

    const codeUpper = code.trim().toUpperCase()

    await turso.execute({
      sql: "DELETE FROM coupons WHERE code = ?",
      args: [codeUpper]
    })

    return NextResponse.json({ success: true, message: 'Cupón eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting coupon:', error)
    return NextResponse.json({
      error: 'Failed to delete coupon',
      details: (error as Error).message || String(error)
    }, { status: 500 })
  }
}
