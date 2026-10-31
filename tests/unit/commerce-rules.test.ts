import { describe, it, expect } from 'vitest'
import { generateSlug, generateUniqueSlug } from '@/lib/slug-utils'
import { optimizeCloudinaryUrl, normalizeColor } from '@/lib/utils'
import {
  checkoutPayloadSchema,
  couponValidationSchema,
  flowTokenSchema,
} from '@/lib/validations/checkout'
import { signFlowParams, normalizeCanonicalSiteUrl } from '@/lib/flow'

function calculateEffectivePrice(price: number, discount_price?: number): number {
  if (discount_price && discount_price > 0 && discount_price < price) {
    return discount_price
  }
  return price
}

function calculateDiscount(
  total: number,
  coupon: { type: 'percentage' | 'fixed'; value: number }
): number {
  if (coupon.type === 'percentage') {
    return Math.round(total * (coupon.value / 100))
  }
  return Math.min(coupon.value, total)
}

function calculateBundleStock(components: Array<{ stock: number; quantity: number }>): number {
  if (components.length === 0) return 0
  const possibleBundles = components.map((c) => Math.floor(c.stock / c.quantity))
  return Math.min(...possibleBundles)
}

describe('Reglas de Negocio Financieras e Inventario Joyas JP', () => {
  it('aplica discount_price correctamente si es menor al precio original', () => {
    expect(calculateEffectivePrice(49990, 39990)).toBe(39990)
    expect(calculateEffectivePrice(49990, 59990)).toBe(49990)
    expect(calculateEffectivePrice(49990, undefined)).toBe(49990)
  })

  it('calcula descuentos de cupones porcentuales y fijos en CLP', () => {
    expect(calculateDiscount(50000, { type: 'percentage', value: 10 })).toBe(5000)
    expect(calculateDiscount(50000, { type: 'fixed', value: 10000 })).toBe(10000)
    expect(calculateDiscount(5000, { type: 'fixed', value: 10000 })).toBe(5000)
  })

  it('resuelve el stock relacional de un conjunto dinámico (bundle)', () => {
    const bundle = [
      { stock: 10, quantity: 1 },
      { stock: 4, quantity: 1 },
      { stock: 8, quantity: 1 },
    ]
    expect(calculateBundleStock(bundle)).toBe(4)

    const outOfStockBundle = [
      { stock: 10, quantity: 1 },
      { stock: 0, quantity: 1 },
    ]
    expect(calculateBundleStock(outOfStockBundle)).toBe(0)
    expect(calculateBundleStock([])).toBe(0)
  })
})

describe('Pasarela de Pagos Flow.cl Nativa (HMAC-SHA256 & URL Canónica)', () => {
  it('ordena parámetros alfabéticamente y genera firma HMAC-SHA256 oficial', () => {
    const secretKey = 'test_secret_key'
    const params = {
      apiKey: 'test_key',
      amount: 49990,
      commerceOrder: 'ORD-1234',
      currency: 'CLP',
      email: 'cliente@joyasjp.cl',
    }

    const signature = signFlowParams(params, secretKey)
    expect(signature).toBeDefined()
    expect(typeof signature).toBe('string')
    expect(signature.length).toBe(64)
  })

  it('normaliza URL canónica sin subdominio www para evitar redirecciones 301 en webhooks POST', () => {
    expect(normalizeCanonicalSiteUrl('https://www.joyasjp.cl/')).toBe('https://joyasjp.cl')
    expect(normalizeCanonicalSiteUrl('https://joyasjp.cl///')).toBe('https://joyasjp.cl')
    expect(normalizeCanonicalSiteUrl('')).toBe('https://joyasjp.cl')
  })
})

describe('Utilidades de SEO, CDN y Validación Zod (Titanium Vault Flow)', () => {
  it('genera slugs limpios y únicos sin tildes ni caracteres especiales', () => {
    expect(generateSlug('Cadena Cubana Plata 925 (Edición Milano)')).toBe(
      'cadena-cubana-plata-925-edicion-milano'
    )
    expect(generateUniqueSlug('Cadena Cubana', ['cadena-cubana', 'cadena-cubana-1'])).toBe(
      'cadena-cubana-2'
    )
  })

  it('optimiza automáticamente URLs de Cloudinary CDN con f_auto,q_auto:good', () => {
    const rawUrl =
      'https://res.cloudinary.com/demo/image/upload/v170000/joyas-jp-ecommerce/cadenas/cubana.jpg'
    const optimized = optimizeCloudinaryUrl(rawUrl, 800)
    expect(optimized).toContain('/upload/f_auto,q_auto:good,w_800,c_limit/')
    expect(optimizeCloudinaryUrl('/assets/logo.webp')).toBe('/assets/logo.webp')
  })

  it('normaliza colores de catálogo y filtra valores de prueba', () => {
    expect(normalizeColor('Pleteado')).toBe('plateado')
    expect(normalizeColor('Dorada')).toBe('dorado')
    expect(normalizeColor('prueba')).toBe('')
  })

  it('valida contratos de Checkout (Starken vs Metro), Token Flow y Cupones con Zod safeParse', () => {
    const validStarkenCheckout = checkoutPayloadSchema.safeParse({
      cartItems: [{ id: 'prod-1', name: 'Cadena Cubana 925', price: 49990, quantity: 2 }],
      customerInfo: {
        name: 'Matías Riquelme',
        email: 'cliente@joyasjp.cl',
        phone: '+56982990513',
        address: 'Av. Providencia 1234',
        city: 'Santiago',
        commune: 'Metropolitana de Santiago',
        rut: '12.345.678-9',
        shippingMethod: 'starken',
      },
      couponCode: 'VIP10',
    })
    expect(validStarkenCheckout.success).toBe(true)

    // Starken sin dirección ni ciudad debe rechazarse
    const missingAddressStarken = checkoutPayloadSchema.safeParse({
      cartItems: [{ id: 'prod-1', name: 'Cadena Cubana 925', price: 49990, quantity: 1 }],
      customerInfo: {
        name: 'Matías Riquelme',
        email: 'cliente@joyasjp.cl',
        phone: '+56982990513',
        commune: 'Metropolitana de Santiago',
        rut: '12.345.678-9',
        shippingMethod: 'starken',
      },
    })
    expect(missingAddressStarken.success).toBe(false)

    // Entrega en Metro permite dirección y ciudad vacías
    const validMetroCheckout = checkoutPayloadSchema.safeParse({
      cartItems: [
        { id: '0f549c7d', name: 'Cubana exótica ICE', price: 15000, quantity: 1 },
        { id: '9c24cf1b', name: 'Cubana gruesa tuki', price: 10000, quantity: 1 },
      ],
      customerInfo: {
        name: 'Guillermo Alvear',
        email: 'cliente@joyasjp.cl',
        phone: '+56982990513',
        address: '',
        city: '',
        commune: 'Metropolitana de Santiago',
        rut: '12.345.678-5',
        shippingMethod: 'metro',
      },
    })
    expect(validMetroCheckout.success).toBe(true)

    const validCoupon = couponValidationSchema.safeParse({
      code: 'milano925',
      cart_amount: 49990,
    })
    expect(validCoupon.success).toBe(true)
    if (validCoupon.success) {
      expect(validCoupon.data.code).toBe('MILANO925')
    }

    expect(flowTokenSchema.safeParse({ token: '7368029A61B02C50E9A6' }).success).toBe(true)
    expect(flowTokenSchema.safeParse({ token: '' }).success).toBe(false)
  })
})
