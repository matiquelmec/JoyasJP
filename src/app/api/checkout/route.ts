import { MercadoPagoConfig, Preference } from 'mercadopago'
import { type NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/db/turso'
import { ProductService } from '@/services/product.service'
import type { CartItem } from '@/hooks/use-cart'
import type { CustomerInfo } from '@/lib/types'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

export async function POST(req: NextRequest) {
  try {
    const requestData = await req.json()

    // Puede venir como array de items (legacy) o como object con cartItems y customerInfo
    let cartItems: CartItem[]
    let customerInfo: CustomerInfo | null = null

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

    // 🛡️ VALIDACIÓN DE PRECIOS EN SERVIDOR (Usando ProductService y Turso)
    const productIds = cartItems.map(item => item.id)
    const dbProducts = await ProductService.getProductsByIds(productIds)

    if (!dbProducts || dbProducts.length === 0) {
      return NextResponse.json(
        { error: 'Error al validar productos en la base de datos' },
        { status: 500 }
      )
    }

    // Mapear productos reales para asegurar precios e integridad
    const validatedItems = cartItems.map((item) => {
      const dbProduct = dbProducts.find((p) => p.id === item.id)

      if (!dbProduct) {
        throw new Error(`Producto no encontrado: ${item.name}`)
      }

      if (dbProduct.stock < item.quantity) {
        throw new Error(`Stock insuficiente para: ${dbProduct.name}`)
      }

      return {
        id: dbProduct.id,
        title: dbProduct.name,
        quantity: item.quantity,
        unit_price: dbProduct.price, // ✅ Usar precio REAL de la DB
        currency_id: 'CLP',
        picture_url: item.imageUrl,
        description: item.description,
      }
    })

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin).replace(/\/$/, "");

    // 1. Crear un ID de orden único ANTES de la preferencia para usarlo como external_reference
    const internalOrderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const preferenceBody: any = {
      items: validatedItems,
      back_urls: {
        success: `${siteUrl}/productos/success`,
        failure: `${siteUrl}/productos/failure`,
        pending: `${siteUrl}/productos/pending`,
      },
      statement_descriptor: 'JOYAS JP',
      external_reference: internalOrderId, // ✅ Este es el puente más seguro
      notification_url: `${siteUrl}/api/webhook/mercadopago`,
      auto_return: 'approved'
    }

    // Agregar información del cliente si está disponible
    if (customerInfo) {
      preferenceBody.payer = {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: {
          number: customerInfo.phone
        },
        address: {
          street_name: customerInfo.address,
          zip_code: '',
          street_number: ''
        }
      }

      if (customerInfo.rut) {
        preferenceBody.payer.identification = {
          type: "RUT",
          number: customerInfo.rut
        }
      }
    }

    const preference = await new Preference(client).create({
      body: preferenceBody,
    })

    // Guardar orden en la base de datos - solo productos (shipping por pagar)
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    try {
      // Formatear datos para que encajen en la DB
      const finalAddress = customerInfo?.department
        ? `${customerInfo.address}, ${customerInfo.department}`
        : customerInfo?.address || ''

      const finalName = customerInfo?.instagram
        ? `${customerInfo.name} (@${customerInfo.instagram.replace('@', '')})`
        : customerInfo?.name || 'Cliente'

      const orderData = {
        id: preference.id, // Preferencia como PK
        customer_name: finalName,
        customer_email: customerInfo?.email || '',
        customer_phone: customerInfo?.phone || '',
        shipping_address: finalAddress,
        shipping_city: customerInfo?.city || '',
        shipping_commune: customerInfo?.commune || '',
        shipping_method: customerInfo?.shippingMethod || 'starken',
        items: JSON.stringify(cartItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.imageUrl
        }))),
        total_amount: totalAmount,
        shipping_cost: 0,
        status: 'pending',
        payment_id: internalOrderId, // ✅ Usamos esto como puente para el webhook
        payment_status: 'pending'
      }

      // Guardar el pedido en Turso
      await turso.execute({
        sql: `INSERT INTO orders (
          id, customer_name, customer_email, customer_phone, shipping_address, 
          shipping_city, shipping_commune, shipping_method, items, total_amount, 
          shipping_cost, status, payment_id, payment_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        args: [
          preference.id as string,
          finalName,
          customerInfo?.email || '',
          customerInfo?.phone || null,
          finalAddress,
          customerInfo?.city || null,
          customerInfo?.commune || null,
          customerInfo?.shippingMethod || 'starken',
          JSON.stringify(cartItems.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            imageUrl: item.imageUrl
          }))),
          totalAmount,
          0,
          'pending',
          internalOrderId,
          'pending'
        ]
      })

    } catch (dbError) {
      console.error('❌ Database Exception during checkout:', dbError)
      throw dbError
    }

    return NextResponse.json({
      checkoutUrl: preference.init_point,
      orderId: preference.id
    })
  } catch (error: unknown) {
    const err = error as Error & { cause?: { message?: string, data?: { message?: string }, error?: string | { message?: string } } }

    let errorMessage = 'An unknown error occurred.'
    if (err.cause) {
      const cause = err.cause
      if (cause.data?.message) {
        errorMessage = cause.data.message
      } else if (typeof cause.error === 'string') {
        errorMessage = cause.error
      } else {
        errorMessage = JSON.stringify(cause.error) || cause.message || 'Unknown Mercado Pago Error'
      }
    } else if (err.message) {
      errorMessage = err.message
    }

    return new NextResponse(
      JSON.stringify({ error: `Mercado Pago Error: ${errorMessage}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
