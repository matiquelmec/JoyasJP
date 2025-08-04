import { MercadoPagoConfig, Preference } from 'mercadopago'
import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import type { CartItem } from '@/hooks/use-cart'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

export async function POST(req: NextRequest) {
  try {
    const requestData = await req.json()
    
    // Puede venir como array de items (legacy) o como object con cartItems y customerInfo
    let cartItems: CartItem[]
    let customerInfo: any = null
    
    if (Array.isArray(requestData)) {
      cartItems = requestData
      // Verificar si los items tienen customerInfo
      if (requestData[0]?.customerInfo) {
        customerInfo = requestData[0].customerInfo
      }
    } else {
      cartItems = requestData.cartItems || requestData
      customerInfo = requestData.customerInfo
    }

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'El carrito está vacío' },
        { status: 400 }
      )
    }

    const preferenceBody: any = {
      items: cartItems.map((item) => ({
        id: item.id,
        title: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: 'CLP',
        picture_url: item.imageUrl,
        description: item.description,
      })),
      back_urls: {
        success: `${req.nextUrl.origin}/shop/success`,
        failure: `${req.nextUrl.origin}/shop/failure`,
        pending: `${req.nextUrl.origin}/shop/pending`,
      },
    }

    // Agregar información del cliente si está disponible
    if (customerInfo) {
      preferenceBody.payer = {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: {
          number: customerInfo.phone
        }
      }
    }

    const preference = await new Preference(client).create({
      body: preferenceBody,
    })

    // Guardar orden en la base de datos
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    try {
      const orderData = {
        id: preference.id, // Usar el ID de MercadoPago como referencia
        customer_name: customerInfo?.name || 'Cliente',
        customer_email: customerInfo?.email || '',
        customer_phone: customerInfo?.phone || '',
        shipping_address: customerInfo?.address || '',
        shipping_city: customerInfo?.city || '',
        shipping_commune: customerInfo?.commune || '',
        items: JSON.stringify(cartItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.imageUrl
        }))),
        total_amount: totalAmount,
        shipping_cost: customerInfo?.shippingCost || 0,
        status: 'pending',
        payment_id: preference.id,
        payment_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: savedOrder, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (orderError) {
        console.error('Error saving order to database:', orderError)
        // No fallar el checkout si no se puede guardar la orden
        // El usuario aún puede continuar con el pago
      } else {
        console.log('Order saved successfully:', savedOrder.id)
      }

    } catch (dbError) {
      console.error('Database error when saving order:', dbError)
      // Continue with checkout even if DB save fails
    }

    return NextResponse.json({ 
      checkoutUrl: preference.init_point,
      orderId: preference.id
    })
  } catch (error: any) {
    console.error('Error creating preference:', JSON.stringify(error, null, 2))

    let errorMessage = 'An unknown error occurred.'
    if (error.cause) {
      const cause = error.cause
      if (cause.data?.message) {
        errorMessage = cause.data.message
      } else if (typeof cause.error === 'string') {
        errorMessage = cause.error
      } else {
        errorMessage = JSON.stringify(cause.error) || cause.message
      }
    } else if (error.message) {
      errorMessage = error.message
    }

    return new NextResponse(
      JSON.stringify({ error: `Mercado Pago Error: ${errorMessage}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
