import { MercadoPagoConfig, Payment } from 'mercadopago'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { type, data } = body

        // Solo nos interesan las notificaciones de pago
        if (type !== 'payment') {
            return NextResponse.json({ received: true })
        }

        const paymentId = data.id

        // 🛡️ Verificar configuración
        if (!process.env.MP_ACCESS_TOKEN) {
            console.error('CRITICAL: MP_ACCESS_TOKEN is not defined')
            return NextResponse.json({ error: 'Config Error' }, { status: 500 })
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!supabaseUrl || !supabaseKey) {
            console.error('❌ Variables de entorno Supabase no disponibles')
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
        }

        // Cliente Supabase con credenciales directas (evita fallos del proxy estático)
        const adminClient = createClient(supabaseUrl, supabaseKey)

        // 🔍 Consultar el estado real del pago en MercadoPago
        const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })
        const payment = await new Payment(client).get({ id: paymentId }) as any

        if (!payment) {
            console.error(`❌ Pago no encontrado en MP: ${paymentId}`)
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
        }

        const { status, status_detail } = payment

        // 🧭 ESTRATEGIA DUAL de búsqueda de orden:
        // 1. Intentar por preference_id (campo estándar cuando MP lo incluye)
        // 2. Fallback: buscar en DB por payment_id numérico (cuando preference_id viene undefined)
        let orderId = payment.preference_id

        console.log(`🔔 Webhook | Pago: ${paymentId} | Preferencia: ${orderId ?? 'N/A'} | Estado: ${status} (${status_detail})`)

        if (!orderId) {
            console.warn(`⚠️ preference_id no disponible para pago ${paymentId}. Buscando por payment_id numérico...`)

            const { data: orderByPaymentId } = await adminClient
                .from('orders')
                .select('id')
                .eq('payment_id', String(paymentId))
                .limit(1)
                .single()

            if (orderByPaymentId?.id) {
                orderId = orderByPaymentId.id
                console.log(`✅ Orden encontrada por payment_id numérico: ${orderId}`)
            } else {
                // Último recurso: el paymentId podría ser directamente el ID de preferencia
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
            console.error('❌ No se pudo encontrar la orden para el pago:', paymentId)
            return NextResponse.json({ received: true }) // Responder 200 para que MP no reintente infinitamente
        }

        // 📦 Procesar según el estado del pago
        if (status === 'approved') {
            console.log(`🔒 Procesando pago aprobado → Orden: ${orderId}`)

            // Guardar el payment_id real del pago en la orden
            await adminClient
                .from('orders')
                .update({ payment_id: String(paymentId), updated_at: new Date().toISOString() })
                .eq('id', orderId)

            // Llamada RPC atómica: marca como pagada Y descuenta stock
            const { data: rpcResult, error: rpcError } = await adminClient.rpc('process_order_payment', {
                p_order_id: orderId,
                p_payment_status: status,
                p_payment_detail: status_detail || 'approved via webhook'
            })

            if (rpcError) {
                console.error('❌ Error CRÍTICO RPC:', rpcError)
                return NextResponse.json({ error: 'RPC Failed', details: rpcError.message }, { status: 500 })
            }

            console.log('✅ Resultado RPC:', rpcResult)

            if (rpcResult && !rpcResult.success) {
                console.warn('⚠️ Orden no procesada:', rpcResult.message)
                // Marcar con estado de error para que el admin lo vea
                await adminClient
                    .from('orders')
                    .update({
                        payment_status: 'stock_error',
                        payment_detail: `⚠️ Cobrado en MP pero error al procesar: ${rpcResult.message}`
                    })
                    .eq('id', orderId)
            }

        } else {
            // Para estados no aprobados (rejected, in_process, pending, etc.)
            const { error: updateError } = await adminClient
                .from('orders')
                .update({
                    payment_status: status,
                    payment_detail: status_detail,
                    payment_id: String(paymentId),
                    updated_at: new Date().toISOString()
                })
                .eq('id', orderId)

            if (updateError) console.error('Error actualizando order:', updateError)
            console.log(`ℹ️ Orden ${orderId} → payment_status: ${status}`)
        }

        return NextResponse.json({ received: true })

    } catch (error: any) {
        console.error('❌ Error en Webhook MercadoPago:', error.message)
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
}
