import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { turso } from '@/lib/db/turso'
import { ProductService } from '@/services/product.service'

// Webhook oficial de Mercado Pago para procesar la confirmación del pago en producción
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    if (action !== 'payment.created' && action !== 'payment.updated') {
      return NextResponse.json({ received: true })
    }

    const paymentId = data?.id
    if (!paymentId) {
      return NextResponse.json({ error: 'Missing payment ID' }, { status: 400 })
    }

    // 🛡️ SEGURIDAD ZERO-TRUST: Verificar autenticidad con API oficial de Mercado Pago
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
    })

    if (!mpRes.ok) {
      console.error('❌ Error al consultar pago en MP:', paymentId, mpRes.statusText)
      return NextResponse.json({ error: 'Failed to fetch payment details' }, { status: 502 })
    }

    const paymentData = await mpRes.json()
    const { status, status_detail, external_reference, preference_id } = paymentData

    let orderId: string | null = null

    // 1. Intentar por preference_id
    if (preference_id) {
      const { rows } = await turso.execute({
        sql: 'SELECT id FROM orders WHERE id = ?',
        args: [preference_id],
      })
      if (rows && rows.length > 0) orderId = String(rows[0].id)
    }

    // 2. Intentar por external_reference
    if (!orderId && external_reference) {
      const { rows } = await turso.execute({
        sql: 'SELECT id FROM orders WHERE payment_id = ?',
        args: [external_reference],
      })
      if (rows && rows.length > 0) orderId = String(rows[0].id)
    }

    // 3. Fallback a paymentId
    if (!orderId) {
      const { rows } = await turso.execute({
        sql: 'SELECT id FROM orders WHERE id = ?',
        args: [String(paymentId)],
      })
      if (rows && rows.length > 0) orderId = String(rows[0].id)
    }

    if (!orderId) {
      console.error('❌ Pedido no encontrado para pago MP:', paymentId)
      return NextResponse.json({ received: true })
    }

    const { rows: orderRows } = await turso.execute({
      sql: 'SELECT coupon_code, payment_status, items FROM orders WHERE id = ?',
      args: [orderId],
    })
    const order = orderRows[0]

    // 🛡️ IDEMPOTENCIA: Si ya estaba aprobado, retornar sin duplicar descuento
    if (order && (order.payment_status === 'approved' || order.payment_status === 'paid')) {
      console.log(`ℹ️ Orden ${orderId} ya procesada anteriormente. Evitando doble descuento.`)
      return NextResponse.json({ received: true, already_processed: true })
    }

    const orderStatus = status === 'approved' ? 'paid' : status

    const tx = await turso.transaction('write')
    try {
      await tx.execute({
        sql: 'UPDATE orders SET status = ?, payment_status = ?, payment_id = ?, payment_detail = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        args: [orderStatus, status, String(paymentId), status_detail || '', orderId],
      })

      // 🛡️ DEDUCCIÓN ATÓMICA DE STOCK E INCREMENTO DE CUPÓN
      if (status === 'approved') {
        if (order && order.coupon_code) {
          await tx.execute({
            sql: 'UPDATE coupons SET usage_count = usage_count + 1 WHERE code = ?',
            args: [order.coupon_code],
          })
          console.log(`🎫 Webhook: Cupón "${order.coupon_code}" incrementado (+1 uso) por orden: ${orderId}`)
        }

        if (order && order.items) {
          try {
            const items = JSON.parse(order.items as string)
            await ProductService.processOrderStockDeduction(tx, items)
          } catch (parseErr) {
            console.error('❌ Error parseando items para deducción de stock:', parseErr)
          }
        }
      }

      await tx.commit()
    } catch (txErr) {
      await tx.rollback()
      throw txErr
    }

    // ⚡ SINCRONIZACIÓN EN 0ms: Purgar caché de la vitrina para actualizar stock en tiempo real
    if (status === 'approved') {
      try {
        revalidatePath('/', 'layout')
        revalidatePath('/productos')
        revalidatePath('/')
        console.log('🔄 Caché de catálogo purgada en 0ms tras pago aprobado.')
      } catch (cacheErr) {
        console.warn('Advertencia revalidando caché en webhook:', cacheErr)
      }
    }

    console.log(`✅ Pedido ${orderId} actualizado a estado: ${orderStatus} (Pago MP: ${paymentId})`)
    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('❌ Webhook Panic:', error.message)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
