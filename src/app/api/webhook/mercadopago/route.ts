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

        const { status, status_detail } = payment
        let orderId = payment.preference_id

        if (!orderId) {
            const { data: orderByPaymentId } = await adminClient
                .from('orders')
                .select('id')
                .eq('payment_id', String(paymentId))
                .limit(1)
                .single()

            if (orderByPaymentId?.id) {
                orderId = orderByPaymentId.id
            } else {
                const { data: orderByPrefId } = await adminClient
                    .from('orders')
                    .select('id')
                    .eq('id', String(paymentId))
                    .limit(1)
                    .single()
                orderId = orderByPrefId?.id || null
            }
        }

        if (!orderId) {
            return NextResponse.json({ received: true })
        }

        if (status === 'approved') {
            // 1. Obtener los items de la orden
            const { data: order } = await adminClient
                .from('orders')
                .select('items, status')
                .eq('id', orderId)
                .single()

            if (order && order.status !== 'paid') {
                // 2. Descontar stock manualmente vía JS (By-pass RPC bug)
                let items: any[] = []
                try {
                    items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
                } catch (e) {
                    console.error('Error parsing items:', e)
                }

                if (Array.isArray(items)) {
                    for (const item of items) {
                        try {
                            // Intentamos descontar stock de forma segura
                            const { data: prod } = await adminClient
                                .from('products')
                                .select('stock')
                                .eq('id', item.id)
                                .single()

                            if (prod) {
                                await adminClient
                                    .from('products')
                                    .update({ stock: Math.max(0, prod.stock - item.quantity) })
                                    .eq('id', item.id)
                                    .gte('stock', item.quantity)
                            }
                        } catch (prodErr) {
                            console.error(`Error updating stock for ${item.id}:`, prodErr)
                        }
                    }
                }

                // 3. Marcar la orden como pagada
                await adminClient
                    .from('orders')
                    .update({
                        status: 'paid',
                        payment_status: status,
                        payment_detail: status_detail,
                        payment_id: String(paymentId),
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', orderId)
            }
        } else {
            // Para otros estados
            await adminClient
                .from('orders')
                .update({
                    payment_status: status,
                    payment_detail: status_detail,
                    payment_id: String(paymentId),
                    updated_at: new Date().toISOString()
                })
                .eq('id', orderId)
        }

        return NextResponse.json({ received: true })

    } catch (error: any) {
        console.error('❌ Error Webhook:', error.message)
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
}
