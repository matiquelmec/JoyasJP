import { Product } from '../../products/types'

export interface CartItem extends Product {
  quantity: number
  addedAt: Date
}

export interface CartState {
  items: CartItem[]
  isOpen: boolean
  totalItems: number
  subtotal: number
}

export interface CartActions {
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateItemQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
}