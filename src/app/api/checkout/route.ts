import { MercadoPagoConfig, Preference } from 'mercadopago'
import { type NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/db/turso'
import { ProductService } from '@/services/product.service'
import { checkoutPayloadSchema } from '@/lib/validations/checkout'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
})

export async function POST(req: NextRequest) {
  try {
    const rawData = await req.json()

    // Adaptar estructuras legacy si viniesen como array
    const normalizedData = Array.isArray(rawData)
      ? {
          cartItems: rawData,
          customerInfo: rawData[0]?.customerInfo || {},
          couponCode: null
        }
      : rawData

    // 🛡️ VALIDACIÓN ESTRICTA CON ZOD V4
    const parsed = checkoutPayloadSchema.safeParse(normalizedData)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Datos de checkout inválidos' },
        { status: 400 }
      )
    }

    const { cartItems, customerInfo, couponCode } = parsed.data

    // 🛡️ RE-VALIDACIÓN DE PRECIOS Y STOCK EN SERVIDOR
    const productIds = cartItems.map((item) => item.id)
    const dbProducts = await ProductService.getProductsByIds(productIds)

    if (!dbProducts || dbProducts.length === 0) {
      return NextResponse.json(
        { error: 'Error al consultar inventario en la base de datos' },
        { status: 500 }
      )
    }

    // Mapear productos con precios reales de base de datos
    const validatedItems = cartItems.map((item) => {
      const dbProduct = dbProducts.find((p) => p.id === item.id)

      if (!dbProduct) {
        throw new Error(`Producto no encontrado en inventario: ${item.name}`)
      }

      if (dbProduct.stock < item.quantity) {
        throw new Error(`Stock insuficiente para: ${dbProduct.name} (Disponibles: ${dbProduct.stock})`)
      }

      // Precedencia estricta: discount_price si es menor al precio normal
      const realUnitPrice =
        dbProduct.discount_price && dbProduct.discount_price < dbProduct.price
          ? dbProduct.discount_price
          : dbProduct.price

      return {
        id: dbProduct.id,
        title: dbProduct.name,
        quantity: item.quantity,
        unit_price: realUnitPrice,
        currency_id: 'CLP',
        picture_url: item.imageUrl || dbProduct.imageUrl,
        description: dbProduct.description || undefined,
      }
    })

    const originalTotal = validatedItems.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    )
    let appliedCoupon: string | null = null
    let discountAmount = 0

    // 🛡️ VALIDACIÓN DE CUPÓN SERVER-SIDE
    if (couponCode) {
      const upperCoupon = couponCode.trim().toUpperCase()
      const { rows } = await turso.execute({
        sql: 'SELECT * FROM coupons WHERE code = ?',
        args: [upperCoupon],
      })

      if (rows.length > 0) {
        const coupon = rows[0]
        const isActive = Number(coupon.is_active) === 1
        const minCartAmount = Number(coupon.min_cart_amount || 0)
        const isExpired = coupon.expires_at ? new Date(coupon.expires_at as string) < new Date() : false
        const isLimitReached =
          coupon.usage_limit !== null && coupon.usage_limit !== undefined
            ? Number(coupon.usage_count || 0) >= Number(coupon.usage_limit)
            : false

        if (isActive && !isExpired && !isLimitReached && originalTotal >= minCartAmount) {
          appliedCoupon = coupon.code as string
          const value = Number(coupon.discount_value)

          if (coupon.discount_type === 'percentage') {
            discountAmount = Math.round(originalTotal * (value / 100))
          } else {
            discountAmount = value
          }

          discountAmount = Math.min(discountAmount, originalTotal)

          // Factor proporcional sin pérdida de centavos
          if (discountAmount > 0) {
            const factor = (originalTotal - discountAmount) / originalTotal
            validatedItems.forEach((item) => {
              item.unit_price = Math.max(1, Math.round(item.unit_price * factor))
            })
          }
        }
      }
    }

    const finalTotal = validatedItems.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    )

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin).replace(/\/$/, '')
    const internalOrderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    const preferenceBody: any = {
      items: validatedItems,
      back_urls: {
        success: `${siteUrl}/productos/success`,
        failure: `${siteUrl}/productos/failure`,
        pending: `${siteUrl}/productos/pending`,
      },
      statement_descriptor: 'JOYAS JP',
      external_reference: internalOrderId,
      notification_url: `${siteUrl}/api/webhook/mercadopago`,
      auto_return: 'approved',
    }

    preferenceBody.payer = {
      name: customerInfo.name,
      email: customerInfo.email,
      phone: {
        number: customerInfo.phone,
      },
      address: {
        street_name: customerInfo.address || '',
        zip_code: '',
        street_number: '',
      },
    }

    if (customerInfo.rut) {
      preferenceBody.payer.identification = {
        type: 'RUT',
        number: customerInfo.rut,
      }
    }

    const preference = await new Preference(client).create({
      body: preferenceBody,
    })

    const finalAddress = customerInfo.department
      ? `${customerInfo.address}, ${customerInfo.department}`
      : customerInfo.address || ''

    const finalName = customerInfo.instagram
      ? `${customerInfo.name} (@${customerInfo.instagram.replace('@', '')})`
      : customerInfo.name

    // 🔒 PERSISTIR ORDEN CON PRECIOS Y STOCK VERIFICADOS
    await turso.execute({
      sql: `INSERT INTO orders (
        id, customer_name, customer_email, customer_phone, shipping_address, 
        shipping_city, shipping_commune, shipping_method, items, total_amount, 
        shipping_cost, status, payment_id, payment_status, coupon_code, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      args: [
        preference.id as string,
        finalName,
        customerInfo.email,
        customerInfo.phone,
        finalAddress,
        customerInfo.city || null,
        customerInfo.commune,
        customerInfo.shippingMethod,
        JSON.stringify(
          validatedItems.map((item) => ({
            id: item.id,
            name: item.title,
            quantity: item.quantity,
            price: item.unit_price,
            imageUrl: item.picture_url,
          }))
        ),
        finalTotal,
        customerInfo.shippingCost,
        'pending',
        internalOrderId,
        'pending',
        appliedCoupon,
      ],
    })

    return NextResponse.json({
      checkoutUrl: preference.init_point,
      orderId: preference.id,
    })
  } catch (error: any) {
    console.error('❌ Checkout Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Error al procesar el pago con Mercado Pago' },
      { status: 500 }
    )
  }
}
