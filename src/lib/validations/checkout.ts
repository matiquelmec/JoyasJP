import { z } from 'zod'

export const couponValidationSchema = z.object({
  code: z.string().min(1, 'El código de cupón es requerido').trim().toUpperCase(),
  cart_amount: z.number().nonnegative('El monto del carrito no puede ser negativo').default(0)
})

export const cartItemSchema = z.object({
  id: z.string().min(1, 'ID de producto requerido'),
  name: z.string().min(1, 'Nombre de producto requerido'),
  price: z.number().positive('El precio debe ser mayor a 0'),
  quantity: z.number().int().positive('La cantidad debe ser un entero positivo'),
  imageUrl: z.string().optional().default(''),
  description: z.string().optional()
})

export const customerInfoSchema = z.object({
  name: z.string().min(2, 'El nombre completo es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(8, 'Número de teléfono requerido'),
  address: z.string().optional().default(''),
  department: z.string().optional(),
  city: z.string().optional().default(''),
  commune: z.string().min(1, 'La región o comuna es requerida'),
  rut: z.string().min(7, 'RUT inválido'),
  instagram: z.string().optional(),
  shippingCost: z.number().nonnegative().default(0),
  shippingMethod: z.enum(['starken', 'metro']).default('starken')
})

export const checkoutPayloadSchema = z.object({
  cartItems: z.array(cartItemSchema).min(1, 'El carrito no puede estar vacío'),
  customerInfo: customerInfoSchema,
  couponCode: z.string().nullable().optional()
})
