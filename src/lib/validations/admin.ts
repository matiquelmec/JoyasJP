import { z } from 'zod'

export const adminLoginSchema = z.object({
  password: z.string().min(1, 'La contraseña maestra es requerida'),
})

export const VALID_ORDER_STATUSES = [
  'pending',
  'paid',
  'approved',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const

export const adminOrderUpdateSchema = z
  .object({
    orderId: z.string().trim().min(1).optional(),
    id: z.string().trim().min(1).optional(),
    status: z.enum(VALID_ORDER_STATUSES, {
      message: `Estado inválido. Valores permitidos: ${VALID_ORDER_STATUSES.join(', ')}`,
    }),
    trackingNumber: z.string().trim().optional(),
  })
  .refine((data) => Boolean(data.orderId || data.id), {
    message: 'El identificador del pedido (orderId) es obligatorio',
    path: ['orderId'],
  })

export const adminStockUpdateSchema = z
  .object({
    id: z.string().trim().min(1).optional(),
    productId: z.string().trim().min(1).optional(),
    stock: z.coerce
      .number()
      .int('El stock debe ser un número entero')
      .min(0, 'El stock no puede ser negativo'),
  })
  .refine((data) => Boolean(data.id || data.productId), {
    message: 'El ID de producto es obligatorio',
    path: ['id'],
  })

export const adminProductRestoreSchema = z
  .object({
    id: z.string().trim().min(1).optional(),
    productId: z.string().trim().min(1).optional(),
    originalStock: z.coerce.number().int().min(0).optional(),
  })
  .refine((data) => Boolean(data.id || data.productId), {
    message: 'El ID de producto es obligatorio',
    path: ['id'],
  })

export const bundleComponentInputSchema = z.object({
  product_id: z.string().trim().min(1, 'ID de componente requerido'),
  quantity: z.coerce.number().int().positive().default(1),
})

export const adminProductMutationSchema = z.object({
  name: z.string().trim().min(1, 'El nombre del producto es obligatorio'),
  price: z.coerce.number().nonnegative('El precio debe ser mayor o igual a 0'),
  discount_price: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
    z.number().nonnegative().nullable().optional()
  ),
  stock: z.coerce.number().int().min(0).default(0),
  category: z.string().trim().min(1, 'La categoría es obligatoria'),
  imageUrl: z.string().nullable().optional(),
  dimensions: z.string().nullable().optional(),
  materials: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  detail: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  specifications: z.any().optional(),
  gallery: z.array(z.string()).optional(),
  variants: z.any().optional(),
  sku: z.string().nullable().optional(),
  code: z.string().nullable().optional(),
  seo: z.any().optional(),
  image_hint: z.string().nullable().optional(),
  is_priority: z.union([z.boolean(), z.number()]).optional(),
  is_bundle: z.union([z.boolean(), z.number()]).optional(),
  slug: z.string().nullable().optional(),
  custom_label: z.string().nullable().optional(),
  components: z.array(bundleComponentInputSchema).optional(),
})

export const adminProductUpdateSchema = adminProductMutationSchema.extend({
  id: z.string().trim().min(1, 'El ID del producto es obligatorio para actualizar'),
})

export const adminProductDeleteSchema = z.object({
  id: z.string().trim().min(1, 'El ID del producto es obligatorio'),
  permanent: z.enum(['true', 'false']).optional(),
})

export const adminCouponMutationSchema = z.object({
  code: z.string().trim().min(2, 'El código del cupón es obligatorio').toUpperCase(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.coerce.number().positive('El valor del descuento debe ser mayor a 0'),
  min_cart_amount: z.coerce.number().nonnegative().default(0),
  usage_limit: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
    z.number().int().positive().nullable().optional()
  ),
  expires_at: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : String(val)),
    z.string().nullable().optional()
  ),
  is_active: z.union([z.boolean(), z.number()]).optional().default(true),
  affiliate_name: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : String(val).trim()),
    z.string().nullable().optional()
  ),
})

export const adminCouponDeleteSchema = z.object({
  code: z.string().trim().min(1, 'El código del cupón es obligatorio').toUpperCase(),
})

export const adminConfigurationSchema = z.object({
  store_name: z.string().trim().min(1, 'El nombre de la tienda es obligatorio'),
  store_email: z
    .string()
    .trim()
    .email('El correo de la tienda debe ser válido')
    .nullable()
    .optional()
    .or(z.literal('')),
  store_description: z.string().trim().nullable().optional(),
  instagram_url: z.string().trim().nullable().optional(),
  tiktok_url: z.string().trim().nullable().optional(),
  whatsapp_number: z.string().trim().nullable().optional(),
})

export const revalidatePayloadSchema = z.object({
  path: z.string().trim().optional(),
  tag: z.string().trim().optional(),
})

export const adminImageUploadSchema = z.object({
  fileName: z.string().trim().min(1, 'Nombre de archivo requerido'),
  fileType: z.enum(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'], {
    message: 'Formato inválido. Solo se permite JPEG, PNG o WebP.',
  }),
  fileSize: z
    .number()
    .positive('Archivo vacío')
    .max(5 * 1024 * 1024, 'El archivo supera el tamaño máximo de 5MB.'),
  category: z.string().trim().default('otros'),
  productCode: z.string().trim().optional().default(''),
})

export const relatedProductsQuerySchema = z.object({
  category: z.string().trim().min(1, 'El parámetro category es obligatorio'),
  id: z.string().trim().optional().default(''),
})

export interface NormalizedPaymentDetail {
  raw: string
  provider?: string
  flowOrder?: number | string
  media?: string | null
  paidAt?: string | null
  amount?: number | null
  trackingNumber?: string | null
}

/**
 * Parsea de forma resiliente los ítems JSON de una orden sin lanzar SyntaxError.
 */
export function safeParseOrderItems(rawItems: unknown): Array<{
  id: string
  name: string
  quantity: number
  price: number
  imageUrl?: string
}> {
  if (Array.isArray(rawItems)) return rawItems
  if (typeof rawItems === 'string' && rawItems.trim().length > 0) {
    try {
      const parsed = JSON.parse(rawItems)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

/**
 * Normaliza `payment_detail` soportando tanto texto plano legado ("Flow Order: 186679066")
 * como JSON estructurado de Flow.cl, evitando caídas HTTP 500 en /api/admin/orders.
 */
export function normalizePaymentDetail(rawDetail: unknown): NormalizedPaymentDetail | null {
  if (rawDetail === null || rawDetail === undefined || rawDetail === '') {
    return null
  }

  if (typeof rawDetail === 'object') {
    const obj = rawDetail as Record<string, any>
    const summaryParts: string[] = []
    if (obj.flowOrder) summaryParts.push(`Flow #${obj.flowOrder}`)
    if (obj.media) summaryParts.push(String(obj.media))
    if (obj.trackingNumber) summaryParts.push(`Seguimiento: ${obj.trackingNumber}`)
    return {
      raw: summaryParts.length > 0 ? summaryParts.join(' • ') : JSON.stringify(obj),
      provider: obj.provider ? String(obj.provider) : undefined,
      flowOrder: obj.flowOrder,
      media: obj.media ?? null,
      paidAt: obj.paidAt ?? null,
      amount: obj.amount !== undefined ? Number(obj.amount) : null,
      trackingNumber: obj.trackingNumber ?? null,
    }
  }

  if (typeof rawDetail === 'string') {
    const trimmed = rawDetail.trim()
    if (!trimmed) return null

    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return normalizePaymentDetail(parsed)
        }
      } catch {
        // Si no es JSON válido, conservar representación textual segura
      }
    }

    const flowMatch = trimmed.match(/Flow Order:\s*(\d+)/i)
    return {
      raw: trimmed,
      provider: flowMatch ? 'flow' : undefined,
      flowOrder: flowMatch ? Number(flowMatch[1]) : undefined,
    }
  }

  return { raw: String(rawDetail) }
}
