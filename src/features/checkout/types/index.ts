import { CartItem } from '../../cart/types'

export interface CheckoutFormData {
  name: string
  email: string
  phone: string
  address: string
  city: string
  region: string
}

export interface ShippingCost {
  cost: number
  freeShippingFrom: number
  zones: string[]
}

export interface Order {
  id: string
  items: CartItem[]
  customer: CheckoutFormData
  subtotal: number
  shippingCost: number
  total: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  paymentId?: string
  mercadoPagoId?: string
  created_at: string
  updated_at?: string
}

export interface PaymentPreference {
  id: string
  init_point: string
  sandbox_init_point: string
}