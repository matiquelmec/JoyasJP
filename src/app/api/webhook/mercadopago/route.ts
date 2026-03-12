import { MercadoPagoConfig, Payment } from 'mercadopago'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
        }

        const adminClient = createClient(supabaseUrl, supabaseKey)
        const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })
        const payment = await new Payment(client).get({ id: paymentId }) as any

        if (!payment) {
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
        }

        const { status, status_detail, preference_id, external_reference } = payment
        let orderId = null

        // 🔍 ESTRATEGIA DE BÚSQUEDA MULTI-CAPA
        // 1. Buscar por ID de preferencia (PK de nuestra tabla)
        if (preference_id) {
            const { data: byId } = await adminClient.from('orders').select('id').eq('id', preference_id).single()
            if (byId) orderId = byId.id
        }

        // 2. Si no, buscar por external_reference (puente seguro que acabamos de implementar)
        if (!orderId && external_reference) {
            const { data: byExt } = await adminClient.from('orders').select('id').eq('id', external_reference).single()
            if (byExt) orderId = byExt.id
        }

        // 3. Si no, buscar por el payment_id real guardado provisionalmente (legacy)
        if (!orderId) {
            const { data: byPayId } = await adminClient.from('orders').select('id').eq('payment_id', String(paymentId)).limit(1).single()
            if (byPayId) orderId = byPayId.id
        }

        if (!orderId) {
            // Un último intento desesperado: el ID del pago real podría ser el preference_id en algunos flujos
            const { data: byPayIdAsId } = await adminClient.from('orders').select('id').eq('id', String(paymentId)).single()
            if (byPayIdAsId) orderId = byPayIdAsId.id
        }

        if (!orderId) {
            console.error('❌ No se encontró el pedido para el pago MP:', paymentId)
            return NextResponse.json({ received: true })
        }

        if (status === 'approved') {
            const { data: order } = await adminClient.from('orders').select('items, status').eq('id', orderId).single()

            if (order && order.status !== 'paid') {
                let items: any[] = []
                try {
                    items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
                } catch (e) {
                    console.error('Error parsing items:', e)
                }

                if (Array.isArray(items)) {
                    for (const item of items) {
                        try {
                            const { data: prod } = await adminClient.from('products').select('stock').eq('id', item.id).single()
                            if (prod) {
                                await adminClient.from('products')
                                    .update({ stock: Math.max(0, prod.stock - item.quantity) })
                                    .eq('id', item.id)
                                    .gte('stock', item.quantity)
                            }
                        } catch (prodErr) {
                            console.error(`Error stock ${item.id}:`, prodErr)
                        }
                    }
                }

                await adminClient.from('orders').update({
                    status: 'paid',
                    payment_status: status,
                    payment_detail: status_detail,
                    payment_id: String(paymentId),
                    updated_at: new Date().toISOString()
                }).eq('id', orderId)
            }
        } else {
            await adminClient.from('orders').update({
                payment_status: status,
                payment_detail: status_detail,
                payment_id: String(paymentId),
                updated_at: new Date().toISOString()
            }).eq('id', orderId)
        }

        return NextResponse.json({ received: true })

    } catch (error: any) {
        console.error('❌ Webhook Panic:', error.message)
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
}
