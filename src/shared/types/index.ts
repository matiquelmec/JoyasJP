// Shared types used across multiple features

export interface NavLink {
  href: string
  label: string
}

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  success: boolean
  message?: string
}

export interface SiteConfiguration {
  store_name: string
  store_description?: string
  store_email?: string
  shipping_cost: number
  free_shipping_from: number
  shipping_zones?: string[]
  admin_email?: string
  notify_new_orders: boolean
  notify_low_stock: boolean
  mercadopago_public_key?: string
  mercadopago_access_token?: string
}

export interface PaginationParams {
  page: number
  limit: number
  total?: number
  totalPages?: number
}

export interface SortParams<T = string> {
  sortBy: T
  sortOrder: 'asc' | 'desc'
}