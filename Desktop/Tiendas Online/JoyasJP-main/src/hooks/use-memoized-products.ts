import { useMemo } from 'react'
import type { Product } from '@/lib/types'
import { normalizeColor } from '@/lib/utils'

interface UseMemoizedProductsProps {
  products: Product[]
  category: string
  color: string
  searchTerm?: string
}

export function useMemoizedProducts({
  products,
  category,
  color,
  searchTerm = ''
}: UseMemoizedProductsProps) {
  return useMemo(() => {
    return products.filter((product) => {
      // Filtro por categoría
      const matchesCategory = 
        category === 'all' || 
        product.category?.toLowerCase() === category.toLowerCase()

      // Filtro por color - comparación exacta después de normalización
      const matchesColor = 
        color === 'all' || 
        normalizeColor(product.color)?.toLowerCase() === color.toLowerCase()

      // Filtro por búsqueda
      const matchesSearch = 
        searchTerm === '' ||
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.materials?.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesCategory && matchesColor && matchesSearch
    })
  }, [products, category, color, searchTerm])
}

// Hook para estadísticas memoizadas
export function useMemoizedStats(products: Product[]) {
  return useMemo(() => {
    if (!products.length) {
      return {
        totalProducts: 0,
        totalValue: 0,
        averagePrice: 0,
        categoryCounts: {},
        colorCounts: {},
        lowStockCount: 0
      }
    }

    const totalProducts = products.length
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0)
    const averagePrice = products.reduce((sum, product) => sum + product.price, 0) / totalProducts
    
    const categoryCounts = products.reduce((acc, product) => {
      const category = product.category || 'Sin categoría'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const colorCounts = products.reduce((acc, product) => {
      const color = product.color || 'Sin color'
      acc[color] = (acc[color] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const lowStockCount = products.filter(product => product.stock < 5).length

    return {
      totalProducts,
      totalValue,
      averagePrice,
      categoryCounts,
      colorCounts,
      lowStockCount
    }
  }, [products])
}