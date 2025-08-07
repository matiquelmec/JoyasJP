export * from './categories'

// General app constants
export const DEFAULT_PAGE_SIZE = 12
export const MAX_PAGE_SIZE = 100

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed', 
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const

export const ADMIN_PASSWORD = 'joyasjp2024'