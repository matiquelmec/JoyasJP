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

        // 🔍 ESTRATEGIA DE BÚSQUEDA ROBUSTA
        // 1. Intentar por preference_id (PK de nuestra tabla)
        if (preference_id) {
            const { data: byId } = await adminClient.from('orders').select('id').eq('id', preference_id).single()
            if (byId) orderId = byId.id
        }

        // 2. Intentar por external_reference (que guardamos en la columna payment_id)
        if (!orderId && external_reference) {
            const { data: byExt } = await adminClient.from('orders').select('id').eq('payment_id', external_reference).single()
            if (byExt) orderId = byExt.id
        }

        // 3. Fallback: El paymentId enviado por el webhook podría ser el preference_id
        if (!orderId) {
            const { data: byIdFallback } = await adminClient.from('orders').select('id').eq('id', String(paymentId)).single()
            if (byIdFallback) orderId = byIdFallback.id
        }

        if (!orderId) {
            console.error('❌ No se encontró el pedido para el pago MP:', paymentId, 'Pref:', preference_id, 'Ext:', external_reference)
            return NextResponse.json({ received: true })
        }

        // 🔒 Ejecución atómica y transaccional mediante RPC en la base de datos
        const { data: rpcResult, error: rpcError } = await adminClient.rpc('process_order_payment', {
            p_order_id: orderId,
            p_payment_status: status,
            p_payment_detail: status_detail || ''
        }) as { data: { success: boolean, message: string } | null, error: any }

        if (rpcError || !rpcResult || !rpcResult.success) {
            console.error('❌ Error en RPC process_order_payment:', rpcError || rpcResult?.message)
            return NextResponse.json({ error: rpcResult?.message || 'Failed to process payment in DB' }, { status: 500 })
        }

        // Guardar el payment_id real de MercadoPago en la orden
        await adminClient.from('orders').update({
            payment_id: String(paymentId),
            updated_at: new Date().toISOString()
        }).eq('id', orderId)

        return NextResponse.json({ received: true })

    } catch (error: any) {
        console.error('❌ Webhook Panic:', error.message)
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
}
