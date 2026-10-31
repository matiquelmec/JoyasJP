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
  addItem: (item: Product, quantity?: number) => boolean
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

        const availableStock = Math.max(0, Number(item.stock ?? 0))

        if (availableStock <= 0) {
          toast.error('Producto agotado', {
            description: `"${item.name}" se encuentra sin unidades disponibles actualmente.`,
          })
          return false
        }

        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity

          if (newQuantity > availableStock) {
            toast.error('Stock insuficiente', {
              description: `Solo hay ${availableStock} ${availableStock === 1 ? 'unidad disponible' : 'unidades disponibles'} de "${item.name}".`,
            })
            return false
          }

          set({
            items: currentItems.map((cartItem) =>
              cartItem.id === item.id
                ? { ...cartItem, stock: availableStock, quantity: newQuantity }
                : cartItem
            ),
          })
          return true
        }

        if (quantity > availableStock) {
          toast.error('Stock insuficiente', {
            description: `Solo hay ${availableStock} ${availableStock === 1 ? 'unidad disponible' : 'unidades disponibles'} de "${item.name}".`,
          })
          return false
        }

        set({
          items: [
            ...currentItems,
            {
              ...item,
              stock: availableStock,
              quantity,
              description: item.description || '',
            },
          ],
        })
        return true
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
        const existingItem = currentItems.find((item) => item.id === id)

        if (existingItem) {
          const availableStock = Math.max(0, Number(existingItem.stock ?? 0))
          if (quantity > availableStock) {
            toast.error('Stock máximo alcanzado', {
              description: `Solo hay ${availableStock} ${availableStock === 1 ? 'unidad disponible' : 'unidades disponibles'} de "${existingItem.name}".`,
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
