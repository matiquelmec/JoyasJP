// Re-export types from feature modules for backward compatibility
// TODO: Gradually update imports throughout the codebase to use feature-specific types

export type { Product, ProductFilters, ProductSearchParams } from '@/features/products'
export type { CartItem, CartState, CartActions } from '@/features/cart'  
export type { CheckoutFormData, Order, PaymentPreference } from '@/features/checkout'
export type { NavLink, ApiResponse, SiteConfiguration } from '@/shared/types'
