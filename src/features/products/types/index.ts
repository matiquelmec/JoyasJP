export interface Product {
  id: string
  name: string
  price: number
  imageUrl: string
  category: string
  dimensions?: string
  materials?: string
  color?: string
  detail?: string
  stock?: number
  description?: string
  imageHint?: string
  specifications?: { name: string; value: string }[]
  gallery?: { imageUrl: string; imageHint: string; isPrimary?: boolean }[]
  quantity?: number
  sku?: string
  variants?: {
    type: string
    options: {
      value: string
      price?: string
      imageUrl?: string
    }[]
  }[]
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
  created_at?: string
  featured?: boolean
}

export interface ProductFilters {
  category?: string
  priceRange?: { min: number; max: number }
  inStock?: boolean
  featured?: boolean
}

export interface ProductSearchParams {
  query?: string
  category?: string
  page?: number
  limit?: number
  sortBy?: 'name' | 'price' | 'created_at'
  sortOrder?: 'asc' | 'desc'
}