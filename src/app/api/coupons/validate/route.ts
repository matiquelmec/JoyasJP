import { NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/db/turso'
import { checkRateLimit } from '@/lib/rate-limit'
import { couponValidationSchema } from '@/lib/validations/checkout'

export async function POST(request: NextRequest) {
  // 🛡️ PROTECCIÓN ANTI-BOTS: Máximo 8 intentos por minuto por IP
  const rateCheck = checkRateLimit(request, 8, 60 * 1000)
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Por favor espera un minuto antes de reintentar.' },
      { status: 429 }
    )
  }

  try {
    const rawBody = await request.json()
    const parsed = couponValidationSchema.safeParse(rawBody)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Datos de cupón inválidos' },
        { status: 400 }
      )
    }

    const { code, cart_amount } = parsed.data

    const { rows } = await turso.execute({
      sql: "SELECT * FROM coupons WHERE code = ?",
      args: [code]
    })

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Cupón no válido' }, { status: 404 })
    }

    const coupon = rows[0]

    // 1. Verificar si está activo
    if (Number(coupon.is_active) !== 1) {
      return NextResponse.json({ error: 'Este cupón está desactivado' }, { status: 400 })
    }

    // 2. Verificar expiración
    if (coupon.expires_at) {
      const expiryDate = new Date(coupon.expires_at as string)
      if (expiryDate < new Date()) {
        return NextResponse.json({ error: 'Este cupón ha expirado' }, { status: 400 })
      }
    }

    // 3. Verificar límite de usos
    if (coupon.usage_limit !== null && coupon.usage_limit !== undefined) {
      const limit = Number(coupon.usage_limit)
      const count = Number(coupon.usage_count || 0)
      if (count >= limit) {
        return NextResponse.json({ error: 'Este cupón ha agotado su límite de usos' }, { status: 400 })
      }
    }

    // 4. Verificar compra mínima
    const minAmount = Number(coupon.min_cart_amount || 0)
    if (cart_amount < minAmount) {
      return NextResponse.json({
        error: `Este cupón requiere una compra mínima de $${minAmount.toLocaleString('es-CL')} CLP`
      }, { status: 400 })
    }

    // 5. Calcular descuento estimado
    let discountAmount = 0
    const value = Number(coupon.discount_value)
    if (coupon.discount_type === 'percentage') {
      discountAmount = Math.round(cart_amount * (value / 100))
    } else {
      discountAmount = value
    }

    discountAmount = Math.min(discountAmount, cart_amount)

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: value,
      discount_amount: discountAmount,
      affiliate_name: coupon.affiliate_name || null
    })

  } catch (error) {
    console.error('Error validating coupon:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
