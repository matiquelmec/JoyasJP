// Core application types

// Navigation
export interface NavLink {
  href: string
  label: string
}

// API Response  
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  success: boolean
  message?: string
}

// Site Configuration
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

// Product
export interface Product {
  id: string
  name: string
  description?: string
  price: number
  imageUrl: string // Database column is actually imageUrl (not image_url)
  category: string
  stock: number
  created_at?: string
  updated_at?: string
  // Actual database fields based on schema analysis
  materials?: string
  dimensions?: string
  color?: string
  detail?: string
  specifications?: string
  gallery?: string[]
  variants?: string[]
  sku?: string
  seo?: string
  image_hint?: string
  deleted_at?: string
  code?: string // Optional product code used as ID
}

export interface ProductFilters {
  category?: string
  priceMin?: number
  priceMax?: number
  inStock?: boolean
  search?: string
}

export interface ProductSearchParams extends ProductFilters {
  page?: number
  limit?: number
  sortBy?: 'price' | 'name' | 'created_at'
  sortOrder?: 'asc' | 'desc'
}

// Cart
export interface CartItem {
  id: string
  name: string
  price: number
  imageUrl: string
  quantity: number
  category: string
  stock: number
}

export interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}

// Checkout & Orders
export interface CheckoutFormData {
  name: string
  email: string
  phone: string
  address: string
  city: string
  region: string
  postalCode?: string
  notes?: string
}

export interface Order {
  id: string
  user_name: string
  user_email: string
  user_phone: string
  shipping_address: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface OrderItem {
  product_id: string
  product_name: string
  price: number
  quantity: number
  imageUrl: string
}

// Utility types
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
