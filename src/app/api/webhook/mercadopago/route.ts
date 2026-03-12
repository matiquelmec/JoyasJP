import { MercadoPagoConfig, Payment } from 'mercadopago'
import { type NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
    let globalDbErr: any = null;

    try {
        const body = await req.json()
        
        // 🚨 GUARDIA DE EMERGENCIA: Loggear TODA entrada del webhook a la DB usando la tabla orders como bitácora 
        // Instanciamos Supabase directamente para bypassear fallos de Proxy (supabaseAdmin)
        try {
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL
            const key = process.env.SUPABASE_SERVICE_ROLE_KEY
            if (url && key) {
                const directAdmin = createClient(url, key)
                const { error: dbErr } = await directAdmin.from('orders').insert({
                    id: `LOG_WH_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                    customer_name: 'WEBHOOK_PAYLOAD',
                    customer_email: 'log@system',
                    customer_phone: '000',
                    shipping_address: 'log',
                    shipping_city: 'log',
                    shipping_commune: 'log',
                    shipping_method: 'log',
                    items: JSON.stringify(body),
                    total_amount: 0,
                    shipping_cost: 0,
                    status: 'pending',
                    payment_status: 'log',
                    payment_detail: 'Registro crudo entrante'
                })
            }
        } catch(e) { console.error('Error log DB', e) }

        const { type, data } = body

        // Solo nos interesan las notificaciones de pago
        if (type !== 'payment') {
            return NextResponse.json({ received: true })
        }

        const paymentId = data.id

        // 🛡️ Consultar el estado real del pago en MercadoPago
        if (!process.env.MP_ACCESS_TOKEN) {
            console.error('CRITICAL: MP_ACCESS_TOKEN is not defined')
            return NextResponse.json({ error: 'Config Error' }, { status: 500 })
        }
        
        const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })
        const payment = await new Payment(client).get({ id: paymentId }) as any

        if (!payment) {
            console.error(`❌ Pago no encontrado en MP: ${paymentId}`)
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
        }

        const { status, status_detail } = payment

        // ✅ ESTRATEGIA DUAL de búsqueda de orden:
        // 1. Intentar por preference_id (viene en el pago cuando se generó desde nuestro checkout)
        // 2. Si no, buscar en la DB por payment_id (el ID numérico del pago)
        let orderId = payment.preference_id

        console.log(`🔔 Webhook | Pago: ${paymentId} | Preferencia: ${orderId ?? 'N/A'} | Estado: ${status} (${status_detail})`)

        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!url || !key) {
            console.error('❌ Variables de entorno Supabase no disponibles')
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
        }
        const adminClient = createClient(url, key)

        // Si preference_id no vino en el pago, buscamos la orden por su payment_id numérico
        if (!orderId) {
            console.warn(`⚠️ preference_id no disponible para pago ${paymentId}. Buscando por payment_id numérico...`)
            const { data: orderByPayment } = await adminClient
                .from('orders')
                .select('id')
                .eq('payment_id', String(paymentId))
                .limit(1)
                .single()

            if (orderByPayment?.id) {
                orderId = orderByPayment.id
                console.log(`✅ Orden encontrada por payment_id numérico: ${orderId}`)
            } else {
                // Último recurso: buscar por el ID de preference que tiene el formato seller_id-uuid
                // El payment_id inicial es el preference.id que guardamos en la DB al hacer checkout
                const { data: orderByPrefFallback } = await adminClient
                    .from('orders')
                    .select('id')
                    .eq('id', String(paymentId))
                    .limit(1)
                    .single()
                orderId = orderByPrefFallback?.id || null
            }
        }

        if (!orderId) {
            console.error('❌ No se pudo encontrar la orden para el pago:', paymentId)
            return NextResponse.json({ error: 'Order not found for payment' }, { status: 404 })
        }

        // 📦 Si el pago fue aprobado, procesar inventario a prueba de balas
        if (status === 'approved') {
            console.log(`🔒 Procesando pago aprobado → Orden: ${orderId}`)

            // Primero guardar el payment_id real del pago en la orden
            await adminClient
                .from('orders')
                .update({ payment_id: String(paymentId), updated_at: new Date().toISOString() })
                .eq('id', orderId)

            // Llamada RPC atómica: actualiza estado de la orden Y descuenta stock
            const { data: rpcResult, error: rpcError } = await adminClient.rpc('process_order_payment', {
                p_order_id: orderId,
                p_payment_status: status,
                p_payment_detail: status_detail || 'approved via webhook'
            })

            if (rpcError) {
                console.error('❌ Error CRÍTICO al procesar orden atómica:', rpcError)
                return NextResponse.json({ error: 'Atomic Transaction Failed', details: rpcError.message }, { status: 500 })
            }

            console.log('✅ Resultado Transacción:', rpcResult)

            // Si el RPC retornó éxito false (ej: sin stock), loguearlo como advertencia crítica Y MARCAR EN DB
            if (rpcResult && !rpcResult.success) {
                const errorMessage = (rpcResult as any).message || 'Stock Error';
                console.warn('⚠️ Orden no procesada (Business Logic Error):', errorMessage)

                // 🚨 ALERTA VISUAL PARA EL ADMIN
                // Marcamos la orden con un estado especial en los detalles para que el admin lo vea
                const { error: alertError } = await adminClient
                    .from('orders')
                    .update({
                        payment_status: 'stock_error',
                        payment_detail: `⚠️ ERROR CRÍTICO: Cobrado en MP pero SIN STOCK. Motivo: ${errorMessage}`
                    })
                    .eq('id', orderId)

                if (alertError) console.error('Error saving alert to DB:', alertError)
            }

        } else {
            // 🔄 Para estados NO aprobados (rejected, in_process, pending, etc.)
            const { error: updateError } = await adminClient
                .from('orders')
                .update({
                    payment_status: status,
                    payment_detail: status_detail,
                    payment_id: String(paymentId),
                    updated_at: new Date().toISOString()
                })
                .eq('id', orderId)

            if (updateError) console.error('Error updating payment info for order:', updateError)
            console.log(`ℹ️ Orden ${orderId} → payment_status: ${status}`)
        }

        return NextResponse.json({ received: true })
    } catch (error: any) {
        console.error('❌ Error en Webhook MercadoPago:', error.message)
        
        try {
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL
            const key = process.env.SUPABASE_SERVICE_ROLE_KEY
            if (url && key) {
                const directAdmin = createClient(url, key)
                const { error: dbErr } = await directAdmin.from('orders').insert({
                    id: `LOG_ERR_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                    customer_name: 'WEBHOOK_CRASH',
                    customer_email: 'log@system',
                    customer_phone: '000',
                    shipping_address: 'log',
                    shipping_city: 'log',
                    shipping_commune: 'log',
                    shipping_method: 'log',
                    items: JSON.stringify({ msg: error.message, stack: String(error) }),
                    total_amount: 0,
                    shipping_cost: 0,
                    status: 'pending',
                    payment_status: 'log',
                    payment_detail: 'Error fatal en webhook'
                })
                globalDbErr = dbErr;
            }
        } catch(e) { console.error('Log falló', e) }

        return NextResponse.json(
            { 
                error: 'Webhook processing failed',
                debug: {
                    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
                    hasMpAccess: !!process.env.MP_ACCESS_TOKEN,
                    dbError: globalDbErr || null
                }
            },
            { status: 500 }
        )
    }
}
