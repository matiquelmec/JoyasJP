import { supabase } from './supabase-client'
import type { Product } from './types'
import { normalizeColor } from './utils'

if (!supabase) {
  throw new Error('Supabase client not initialized')
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, stock')
    .gt('stock', 0)

  if (error) {
    // console.error('Error fetching products:', error)
    throw error
  }

  // Normalizar colores en los productos
  const normalizedProducts = (data || []).map(product => ({
    ...product,
    color: product.color ? normalizeColor(product.color) : product.color
  }))

  return normalizedProducts as unknown as Product[]
}

export async function getColors(): Promise<string[]> {
  // Obtener colores solo de productos disponibles (mismo criterio que getProducts)
  const { data, error } = await supabase
    .from('products')
    .select('color')
    .gt('stock', 0)
    .not('color', 'is', null)
    .neq('color', '')

  if (error) {
    // console.error('Error fetching colors:', error)
    throw error
  }

  const colors = (data || [])
    .map((item: any) => {
      if (!item.color) return null
      const normalized = normalizeColor(item.color.toString().trim())
      if (!normalized || normalized === 'prueba') return null
      // Capitalize the first letter properly
      return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase()
    })
    .filter(Boolean) // Remove null/undefined
    .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates

  return colors
}

export async function createOrder(orderDetails: {
  customer_name: string
  shipping_address: string
  contact_email: string
  ordered_products: { product_id: string; quantity: number }[]
}) {
  const response = await fetch('/api/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderDetails),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to create order.')
  }

  return response.json()
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, stock')
    .eq('id', id)
    .single()

  if (error) {
    // console.error('Error fetching product by ID:', error)
    return null
  }

  // Normalizar color del producto
  if (data && data.color) {
    data.color = normalizeColor(data.color)
  }

  return data as unknown as Product
}

export async function getRelatedProducts(
  currentProductId: string,
  category: string,
  limit?: number
): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, stock')
    .eq('category', category)
    .neq('id', currentProductId)
    .gt('stock', 0)
    .limit(limit || 4) // Usa el límite proporcionado o 4 por defecto

  if (error) {
    // console.error('Error fetching related products:', error)
    return []
  }

  // Normalizar colores en productos relacionados
  const normalizedProducts = (data || []).map(product => ({
    ...product,
    color: product.color ? normalizeColor(product.color) : product.color
  }))

  return normalizedProducts as unknown as Product[]
}

// You can add more API functions here, e.g., getProductById, createProduct, etc.
