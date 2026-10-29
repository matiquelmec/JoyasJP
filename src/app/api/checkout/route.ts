import { type NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/db/turso'
import { ProductService } from '@/services/product.service'
import { checkoutPayloadSchema } from '@/lib/validations/checkout'
import { createFlowPayment } from '@/lib/flow'

export async function POST(req: NextRequest) {
  try {
    const rawData = await req.json()

    // Adaptar estructuras legacy si viniesen como array
    const normalizedData = Array.isArray(rawData)
      ? {
          cartItems: rawData,
          customerInfo: rawData[0]?.customerInfo || {},
          couponCode: null,
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
        imageUrl: item.imageUrl || dbProduct.imageUrl,
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
        const isExpired = coupon.expires_at
          ? new Date(coupon.expires_at as string) < new Date()
          : false
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
        }
      }
    }

    const finalTotal = Math.max(0, originalTotal - discountAmount)
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin).replace(/\/$/, '')
    const internalOrderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    const finalAddress = customerInfo.department
      ? `${customerInfo.address}, ${customerInfo.department}`
      : customerInfo.address || ''

    const finalName = customerInfo.instagram
      ? `${customerInfo.name} (@${customerInfo.instagram.replace('@', '')})`
      : customerInfo.name

    // 🔒 PERSISTIR ORDEN EN ESTADO PENDIENTE
    await turso.execute({
      sql: `INSERT INTO orders (
        id, customer_name, customer_email, customer_phone, shipping_address, 
        shipping_city, shipping_commune, shipping_method, items, total_amount, 
        shipping_cost, status, payment_id, payment_status, coupon_code, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      args: [
        internalOrderId,
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
            imageUrl: item.imageUrl,
          }))
        ),
        finalTotal,
        customerInfo.shippingCost || 0,
        'pending',
        internalOrderId,
        'pending',
        appliedCoupon,
      ],
    })

    // 💳 CREAR TRANSACCIÓN EN FLOW.CL
    const totalItemsCount = validatedItems.reduce((acc, it) => acc + it.quantity, 0)
    const subject = `Joyas JP: Pedido ${internalOrderId} (${totalItemsCount} pieza${totalItemsCount > 1 ? 's' : ''})`

    const flowPayment = await createFlowPayment({
      commerceOrder: internalOrderId,
      subject,
      currency: 'CLP',
      amount: finalTotal,
      email: customerInfo.email,
      urlConfirmation: `${siteUrl}/api/webhook/flow`,
      urlReturn: `${siteUrl}/api/flow/return`,
      optional: {
        customerName: finalName,
        phone: customerInfo.phone,
      },
    })

    // Actualizar payment_id con el token emitido por Flow
    await turso.execute({
      sql: 'UPDATE orders SET payment_id = ? WHERE id = ?',
      args: [flowPayment.token, internalOrderId],
    })

    return NextResponse.json({
      checkoutUrl: flowPayment.redirectUrl,
      orderId: internalOrderId,
      flowOrder: flowPayment.flowOrder,
    })
  } catch (error: any) {
    console.error('❌ Checkout Error (Flow):', error)
    return NextResponse.json(
      { error: error?.message || 'Error al procesar el pago con Flow' },
      { status: 500 }
    )
  }
}
