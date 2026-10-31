import { z } from 'zod'

export const couponValidationSchema = z.object({
  code: z.string().min(1, 'El código de cupón es requerido').trim().toUpperCase(),
  cart_amount: z.number().nonnegative('El monto del carrito no puede ser negativo').default(0),
})

export const cartItemSchema = z.object({
  id: z.string().min(1, 'ID de producto requerido'),
  name: z.string().min(1, 'Nombre de producto requerido'),
  price: z.number().positive('El precio debe ser mayor a 0'),
  quantity: z.number().int().positive('La cantidad debe ser un entero positivo'),
  imageUrl: z.string().optional().default(''),
  description: z.string().optional(),
})

export const customerInfoSchema = z
  .object({
    name: z.string().trim().min(2, 'El nombre completo es requerido'),
    email: z.string().trim().email('Email inválido'),
    phone: z.string().trim().min(8, 'Número de teléfono requerido'),
    address: z.string().trim().optional().default(''),
    department: z.string().trim().optional(),
    city: z.string().trim().optional().default(''),
    commune: z.string().trim().min(1, 'La región o comuna es requerida'),
    rut: z.string().trim().min(7, 'RUT inválido'),
    instagram: z.string().trim().optional(),
    shippingCost: z.number().nonnegative().default(0),
    shippingMethod: z.enum(['starken', 'metro']).default('starken'),
  })
  .superRefine((data, ctx) => {
    if (data.shippingMethod === 'starken') {
      if (!data.address || data.address.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['address'],
          message: 'La dirección de calle y número es obligatoria para envíos por Starken',
        })
      }
      if (!data.city || data.city.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['city'],
          message: 'La ciudad o comuna es obligatoria para envíos por Starken',
        })
      }
    }
  })

export const checkoutPayloadSchema = z.object({
  cartItems: z.array(cartItemSchema).min(1, 'El carrito no puede estar vacío'),
  customerInfo: customerInfoSchema,
  couponCode: z.string().nullable().optional(),
})

export const flowTokenSchema = z.object({
  token: z.string().trim().min(5, 'Token de Flow inválido o ausente'),
})
