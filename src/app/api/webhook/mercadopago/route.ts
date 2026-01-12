import { MercadoPagoConfig, Payment } from 'mercadopago'
import { type NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
})

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { type, data } = body

        // Solo nos interesan las notificaciones de pago
        if (type !== 'payment') {
            return NextResponse.json({ received: true })
        }

        const paymentId = data.id

        // 🛡️ Consultar el estado real del pago en MercadoPago
        const payment = await new Payment(client).get({ id: paymentId }) as any

        if (!payment) {
            console.error(`❌ Pago no encontrado en MP: ${paymentId}`)
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
        }

        const { status, status_detail, id } = payment

        // MP usa preference_id o order.id para mapear según la versión
        const orderId = payment.order?.id || payment.preference_id

        console.log(`🔔 Webhook recibido: Pago ${id} - Estado: ${status} (${status_detail}) - Orden: ${orderId}`)

        if (!supabaseAdmin) {
            console.error('❌ Cliente administrativo de Supabase no disponible')
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
        }

        // Actualizar la orden en la base de datos
        const { error: updateError } = await supabaseAdmin
            .from('orders')
            .update({
                status: status === 'approved' ? 'paid' : status,
                payment_status: status,
                payment_detail: status_detail,
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId)

        if (updateError) {
            console.error('❌ Error al actualizar la orden en DB:', updateError)
            return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
        }

        // 📦 Si el pago fue aprobado, podrías disparar aquí lógica adicional (ej: enviar mail)
        if (status === 'approved') {
            console.log(`✅ Orden confirmada para el pago ${id}`)
        }

        return NextResponse.json({ received: true })
    } catch (error: any) {
        console.error('❌ Error en Webhook MercadoPago:', error.message)
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        )
    }
}
