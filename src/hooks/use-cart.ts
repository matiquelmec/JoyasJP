import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/lib/types'
import { toast } from 'sonner'

export interface CartItem extends Product {
  quantity: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (item: Product, quantity?: number) => void
  removeItem: (id: string) => void
  updateItemQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (item, quantity = 1) => {
        const currentItems = get().items
        const existingItem = currentItems.find(
          (cartItem) => cartItem.id === item.id
        )

        const availableStock = item.stock || 0

        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity

          if (newQuantity > availableStock) {
            toast.error(`Stock insuficiente`, {
              description: `Solo hay ${availableStock} unidades disponibles de "${item.name}".`
            })
            return
          }

          set({
            items: currentItems.map((cartItem) =>
              cartItem.id === item.id
                ? { ...cartItem, quantity: newQuantity }
                : cartItem
            ),
          })
        } else {
          if (quantity > availableStock) {
            toast.error(`Stock insuficiente`, {
              description: `Solo hay ${availableStock} unidades disponibles de "${item.name}".`
            })
            return
          }

          set({
            items: [
              ...currentItems,
              { ...item, quantity, description: item.description || '' },
            ],
          })
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) })
      },

      updateItemQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id)
          return
        }

        const currentItems = get().items
        const existingItem = currentItems.find(item => item.id === id)

        if (existingItem) {
          const availableStock = existingItem.stock || 0
          if (quantity > availableStock) {
            toast.error(`Stock máximo alcanzado`, {
              description: `Solo hay ${availableStock} unidades disponibles de "${existingItem.name}".`
            })
            return
          }
        }

        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        })
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
    }
  )
)
