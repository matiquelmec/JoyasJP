import { MercadoPagoConfig, Payment } from 'mercadopago'
import { type NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
})

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        
        // 🚨 GUARDIA DE EMERGENCIA: Loggear TODA entrada del webhook a la DB usando la tabla orders como bitácora 
        try {
            if (supabaseAdmin) {
                await supabaseAdmin.from('orders').insert({
                    id: `LOG_WH_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                    customer_name: 'WEBHOOK_PAYLOAD',
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
        const payment = await new Payment(client).get({ id: paymentId }) as any

        if (!payment) {
            console.error(`❌ Pago no encontrado en MP: ${paymentId}`)
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
        }

        const { status, status_detail } = payment

        // ✅ CRÍTICO: usar preference_id (NO order.id que es un ID interno de MP diferente)
        // orders.id en DB = preference.id del checkout
        const orderId = payment.preference_id

        console.log(`🔔 Webhook | Pago: ${paymentId} | Preferencia: ${orderId} | Estado: ${status} (${status_detail})`)

        if (!supabaseAdmin) {
            console.error('❌ Cliente administrativo de Supabase no disponible')
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
        }

        if (!orderId) {
            console.error('❌ No se pudo obtener preference_id del pago:', paymentId)
            return NextResponse.json({ error: 'Missing preference_id' }, { status: 400 })
        }

        // 📦 Si el pago fue aprobado, procesar inventario a prueba de balas
        if (status === 'approved') {
            console.log(`🔒 Procesando pago aprobado → Orden: ${orderId}`)

            // Primero guardar el payment_id real del pago en la orden
            await supabaseAdmin
                .from('orders')
                .update({ payment_id: paymentId, updated_at: new Date().toISOString() })
                .eq('id', orderId)

            // Llamada RPC atómica: actualiza estado de la orden Y descuenta stock
            const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc('process_order_payment', {
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
                const { error: alertError } = await supabaseAdmin
                    .from('orders')
                    .update({
                        // No la marcamos como 'paid' para evitar envíos accidentales
                        // La dejamos en el estado actual (pending) pero con notas alarmantes
                        payment_status: 'stock_error',
                        payment_detail: `⚠️ ERROR CRÍTICO: Cobrado en MP pero SIN STOCK. Motivo: ${errorMessage}`
                    })
                    .eq('id', orderId)

                if (alertError) console.error('Error saving alert to DB:', alertError)
            }

        } else {
            // 🔄 Para estados NO aprobados (rejected, in_process, pending, etc.)
            // IMPORTANTE: No tocar orders.status (tiene CHECK constraint con valores fijos)
            // Solo actualizamos los campos de pago que son texto libre
            const { error: updateError } = await supabaseAdmin
                .from('orders')
                .update({
                    // status: NO se cambia - la orden sigue 'pending' hasta ser aprobada o cancelada manualmente
                    payment_status: status,        // Estado de MP (puede ser cualquier valor)
                    payment_detail: status_detail, // Detalle de MP
                    payment_id: paymentId,         // ID real del pago en MP
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
            if (supabaseAdmin) {
                await supabaseAdmin.from('orders').insert({
                    id: `LOG_ERR_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                    customer_name: 'WEBHOOK_CRASH',
                    items: JSON.stringify({ msg: error.message, stack: String(error) }),
                    total_amount: 0,
                    shipping_cost: 0,
                    status: 'pending',
                    payment_status: 'log',
                    payment_detail: 'Error fatal en webhook'
                })
            }
        } catch(e) { console.error('Log falló', e) }

        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        )
    }
}
