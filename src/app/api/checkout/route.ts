import { type NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/db/turso'
import { ProductService } from '@/services/product.service'
import { OrderService, consolidateCartItems } from '@/services/order.service'
import { checkoutPayloadSchema } from '@/lib/validations/checkout'
import { createFlowPayment, normalizeCanonicalSiteUrl } from '@/lib/flow'

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

    // 🛡️ 1. VALIDACIÓN ESTRICTA CON ZOD V4
    const parsed = checkoutPayloadSchema.safeParse(normalizedData)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Datos de checkout inválidos' },
        { status: 400 }
      )
    }

    const { customerInfo, couponCode } = parsed.data
    const consolidatedCart = consolidateCartItems(parsed.data.cartItems)

    // 🛡️ 2. RE-VALIDACIÓN AUTORITATIVA DE PRECIOS Y STOCK FÍSICO EN SERVIDOR
    const productIds = consolidatedCart.map((item) => item.id)
    const dbProducts = await ProductService.getProductsByIds(productIds)

    if (!dbProducts || dbProducts.length === 0) {
      return NextResponse.json(
        { error: 'Los productos seleccionados no están disponibles en el inventario activo' },
        { status: 400 }
      )
    }

    const validatedItems = consolidatedCart.map((item) => {
      const dbProduct = dbProducts.find((p) => p.id === item.id)

      if (!dbProduct) {
        throw new Error(`Producto no disponible en inventario: ${item.name}`)
      }

      if (dbProduct.stock < item.quantity) {
        throw new Error(
          `Stock insuficiente para "${dbProduct.name}" (Disponibles: ${dbProduct.stock})`
        )
      }

      // Precedencia estricta en servidor: discount_price solo si es positivo y menor al precio base
      const realUnitPrice =
        dbProduct.discount_price &&
        dbProduct.discount_price > 0 &&
        dbProduct.discount_price < dbProduct.price
          ? Math.round(dbProduct.discount_price)
          : Math.round(dbProduct.price)

      return {
        id: dbProduct.id,
        title: dbProduct.name,
        quantity: item.quantity,
        unit_price: realUnitPrice,
        imageUrl: dbProduct.imageUrl || item.imageUrl,
        description: dbProduct.description || undefined,
      }
    })

    // Verificar colisiones físicas entre productos simples y componentes de conjuntos (bundle_items)
    await OrderService.verifyCartPhysicalStock(
      validatedItems.map((it) => ({ id: it.id, quantity: it.quantity })),
      dbProducts.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        stock: p.stock,
        is_bundle: Boolean(p.is_bundle),
      }))
    )

    const originalTotal = validatedItems.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    )
    let appliedCoupon: string | null = null
    let discountAmount = 0

    // 🛡️ 3. VALIDACIÓN DETERMINISTA DE CUPÓN SERVER-SIDE
    if (couponCode && couponCode.trim().length > 0) {
      const upperCoupon = couponCode.trim().toUpperCase()
      const { rows } = await turso.execute({
        sql: 'SELECT * FROM coupons WHERE code = ?',
        args: [upperCoupon],
      })

      if (rows.length > 0) {
        const coupon = rows[0]
        const isActive = Number(coupon.is_active) === 1 || String(coupon.is_active) === 'true'
        const minCartAmount = Number(coupon.min_cart_amount || 0)
        const isExpired = coupon.expires_at
          ? new Date(coupon.expires_at as string) < new Date()
          : false
        const isLimitReached =
          coupon.usage_limit !== null && coupon.usage_limit !== undefined
            ? Number(coupon.usage_count || 0) >= Number(coupon.usage_limit)
            : false

        if (isActive && !isExpired && !isLimitReached && originalTotal >= minCartAmount) {
          appliedCoupon = String(coupon.code).toUpperCase()
          const value = Number(coupon.discount_value)

          if (coupon.discount_type === 'percentage') {
            discountAmount = Math.round(originalTotal * (value / 100))
          } else {
            discountAmount = Math.round(value)
          }

          discountAmount = Math.min(discountAmount, originalTotal)
        }
      }
    }

    const finalTotal = Math.max(0, Math.round(originalTotal - discountAmount))
    if (finalTotal < 350) {
      return NextResponse.json(
        { error: 'El monto final del pedido debe ser al menos $350 CLP para procesar el pago.' },
        { status: 400 }
      )
    }

    const siteUrl = normalizeCanonicalSiteUrl(
      process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin
    )
    const internalOrderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    const rawAddress = customerInfo.department
      ? `${customerInfo.address}, ${customerInfo.department}`
      : customerInfo.address || ''
    const finalAddress =
      customerInfo.shippingMethod === 'metro' && !rawAddress.trim()
        ? 'Entrega en Metro (Santiago - Por coordinar)'
        : rawAddress.trim()

    const finalName = customerInfo.instagram
      ? `${customerInfo.name} (@${customerInfo.instagram.replace('@', '')})`
      : customerInfo.name

    // 🔒 4. PERSISTIR ORDEN EN ESTADO PENDIENTE
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
        customerInfo.city || (customerInfo.shippingMethod === 'metro' ? 'Santiago' : null),
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
        0,
        'pending',
        internalOrderId,
        'pending',
        appliedCoupon,
      ],
    })

    // 💳 5. CREAR TRANSACCIÓN FIRMADA EN FLOW.CL
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

    // Actualizar payment_id con el token criptográfico emitido por Flow
    await turso.execute({
      sql: 'UPDATE orders SET payment_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [flowPayment.token, internalOrderId],
    })

    return NextResponse.json({
      checkoutUrl: flowPayment.redirectUrl,
      orderId: internalOrderId,
      flowOrder: flowPayment.flowOrder,
    })
  } catch (error: any) {
    console.error('❌ Checkout Error (Flow):', error)
    const msg = error?.message || 'Error al procesar el pago con Flow'
    const isClientError =
      msg.includes('Stock insuficiente') ||
      msg.includes('no disponible') ||
      msg.includes('no existe') ||
      msg.includes('monto mínimo')
    return NextResponse.json({ error: msg }, { status: isClientError ? 400 : 500 })
  }
}
