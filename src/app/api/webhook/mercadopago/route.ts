import { MercadoPagoConfig, Payment } from 'mercadopago'
import { type NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/db/turso'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { type, data } = body

        if (type !== 'payment') {
            return NextResponse.json({ received: true })
        }

        const paymentId = data.id

        if (!process.env.MP_ACCESS_TOKEN) {
            return NextResponse.json({ error: 'Config Error' }, { status: 500 })
        }

        const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })
        const payment = await new Payment(client).get({ id: paymentId }) as any

        if (!payment) {
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
        }

        const { status, status_detail, preference_id, external_reference } = payment
        let orderId = null

        // 🔍 BÚSQUEDA DE PEDIDO EN TURSO
        // 1. Intentar por preference_id
        if (preference_id) {
            const { rows } = await turso.execute({
                sql: "SELECT id FROM orders WHERE id = ?",
                args: [preference_id]
            })
            if (rows && rows.length > 0) orderId = rows[0].id
        }

        // 2. Intentar por external_reference
        if (!orderId && external_reference) {
            const { rows } = await turso.execute({
                sql: "SELECT id FROM orders WHERE payment_id = ?",
                args: [external_reference]
            })
            if (rows && rows.length > 0) orderId = rows[0].id
        }

        // 3. Fallback
        if (!orderId) {
            const { rows } = await turso.execute({
                sql: "SELECT id FROM orders WHERE id = ?",
                args: [String(paymentId)]
            })
            if (rows && rows.length > 0) orderId = rows[0].id
        }

        if (!orderId) {
            console.error('❌ No se encontró el pedido para el pago MP:', paymentId, 'Pref:', preference_id, 'Ext:', external_reference)
            return NextResponse.json({ received: true })
        }

        // Determinar estado final del pedido
        const orderStatus = (status === 'approved') ? 'paid' : status

        // Actualizar datos del pago y estado en Turso
        await turso.execute({
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

        console.log(`✅ Pedido ${orderId} actualizado con éxito a estado: ${orderStatus} (Pago MP: ${paymentId})`)
        return NextResponse.json({ received: true })

    } catch (error: any) {
        console.error('❌ Webhook Panic:', error.message)
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
}
