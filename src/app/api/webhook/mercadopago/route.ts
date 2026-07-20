import { NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/db/turso'

// Webhook de MercadoPago para procesar la confirmación del pago en producción
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

        // Consultar el detalle del pago a la API de MercadoPago
        const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: {
                Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
            }
        })

        if (!mpRes.ok) {
            console.error('❌ Error al consultar pago en MP:', paymentId, mpRes.statusText)
            return NextResponse.json({ error: 'Failed to fetch payment details' }, { status: 502 })
        }

        const paymentData = await mpRes.json()
        const { status, status_detail, external_reference, preference_id } = paymentData

        let orderId: string | null = null

        // 1. Intentar por preference_id (PK de la orden)
        if (preference_id) {
            const { rows } = await turso.execute({
                sql: "SELECT id FROM orders WHERE id = ?",
                args: [preference_id]
            })
            if (rows && rows.length > 0) orderId = rows[0].id ? String(rows[0].id) : null
        }

        // 2. Intentar por external_reference
        if (!orderId && external_reference) {
            const { rows } = await turso.execute({
                sql: "SELECT id FROM orders WHERE payment_id = ?",
                args: [external_reference]
            })
            if (rows && rows.length > 0) orderId = rows[0].id ? String(rows[0].id) : null
        }

        // 3. Fallback
        if (!orderId) {
            const { rows } = await turso.execute({
                sql: "SELECT id FROM orders WHERE id = ?",
                args: [String(paymentId)]
            })
            if (rows && rows.length > 0) orderId = rows[0].id ? String(rows[0].id) : null
        }

        if (!orderId) {
            console.error('❌ No se encontró el pedido para el pago MP:', paymentId, 'Pref:', preference_id, 'Ext:', external_reference)
            return NextResponse.json({ received: true })
        }

        // Obtener datos del pedido actual para verificar cupones
        const { rows: orderRows } = await turso.execute({
            sql: "SELECT coupon_code, payment_status FROM orders WHERE id = ?",
            args: [orderId]
        })
        const order = orderRows[0]

        // Determinar estado final del pedido
        const orderStatus = (status === 'approved') ? 'paid' : status

        const tx = await turso.transaction("write")
        try {
            // Actualizar datos del pago y estado en Turso
            await tx.execute({
                sql: `UPDATE orders SET 
                    status = ?, 
                    payment_status = ?, 
                    payment_id = ?, 
                    payment_detail = ?, 
                    updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?`,
                args: [
                    orderStatus,
                    status,
                    String(paymentId),
                    status_detail || '',
                    orderId
                ]
            })

            // Si el pago es aprobado, el estado anterior no era aprobado y tiene cupón, incrementamos el uso
            if (status === 'approved' && order && order.payment_status !== 'approved' && order.coupon_code) {
                await tx.execute({
                    sql: "UPDATE coupons SET usage_count = usage_count + 1 WHERE code = ?",
                    args: [order.coupon_code]
                })
                console.log(`🎫 Webhook: Cupón "${order.coupon_code}" incrementado (+1 uso) por orden aprobada: ${orderId}`)
            }

            await tx.commit()
        } catch (txErr) {
            await tx.rollback()
            throw txErr
        }

        console.log(`✅ Pedido ${orderId} actualizado con éxito a estado: ${orderStatus} (Pago MP: ${paymentId})`)
        return NextResponse.json({ received: true })

    } catch (error: any) {
        console.error('❌ Webhook Panic:', error.message)
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
}
