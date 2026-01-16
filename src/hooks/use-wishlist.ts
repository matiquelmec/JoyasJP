'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { toast } from 'sonner'
import type { Product } from '@/lib/types'

interface WishlistState {
  items: Product[]
  addItem: (item: Product) => void
  removeItem: (itemId: string) => void
  isItemInWishlist: (itemId: string) => boolean
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const currentItems = get().items
        const existingItem = currentItems.find((i) => i.id === item.id)

        if (existingItem) {
          return toast('Producto ya en favoritos')
        }

        set({ items: [...currentItems, item] })
        toast.success('Añadido a favoritos', {
          description: `${item.name} ha sido añadido a tu lista de deseos.`,
        })
      },
      removeItem: (itemId) => {
        set({ items: get().items.filter((item) => item.id !== itemId) })
        toast.info('Eliminado de favoritos', {
          description: 'El producto ha sido eliminado de tu lista de deseos.',
        })
      },
      isItemInWishlist: (itemId) => {
        return get().items.some((item) => item.id === itemId)
      },
    }),
    {
      name: 'wishlist-storage', // Nombre para el localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
)
