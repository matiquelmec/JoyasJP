import useSWR from 'swr'
import type { Product } from '@/lib/types'

interface ProductsResponse {
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

interface UseProductsOptions {
  page?: number
  limit?: number
  category?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export function useProducts(options: UseProductsOptions = {}) {
  const {
    page = 1,
    limit = 20,
    category,
    minPrice,
    maxPrice,
    search,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = options

  // Construir URL con parámetros
  const params = new URLSearchParams()
  params.append('page', page.toString())
  params.append('limit', limit.toString())
  params.append('sortBy', sortBy)
  params.append('sortOrder', sortOrder)

  if (category) params.append('category', category)
  if (minPrice !== undefined) params.append('minPrice', minPrice.toString())
  if (maxPrice !== undefined) params.append('maxPrice', maxPrice.toString())
  if (search) params.append('search', search)

  const { data, error, isLoading, mutate } = useSWR<ProductsResponse>(
    `/api/products?${params.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // Deduplicar requests por 1 minuto
      keepPreviousData: true, // Mantener datos anteriores mientras carga nuevos
    }
  )

  return {
    products: data?.products || [],
    pagination: data?.pagination || {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasMore: false,
    },
    isLoading,
    isError: error,
    mutate,
  }
}

// Hook para producto individual
export function useProduct(id: string) {
  const { data, error, isLoading } = useSWR<Product>(
    id ? `/api/products/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 3600000, // 1 hora para productos individuales
    }
  )

  return {
    product: data,
    isLoading,
    isError: error,
  }
}

// Hook para búsqueda con debounce
import { useEffect, useState } from 'react'

export function useProductSearch(initialSearch = '') {
  const [search, setSearch] = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [search])

  const { products, pagination, isLoading, isError } = useProducts({
    search: debouncedSearch,
    limit: 10,
  })

  return {
    search,
    setSearch,
    results: products,
    isSearching: isLoading,
    isError,
    hasResults: products.length > 0,
  }
}
