// ⚡ DYNAMIC IMPORTS OPTIMIZADOS
// Este archivo centraliza todos los dynamic imports para mejor performance

import dynamic from 'next/dynamic'

// ⚡ COMPONENTES ADMIN - Solo cargan cuando se necesitan
export const AdminDashboard = dynamic(() => import('./admin/admin-dashboard').then(mod => ({ default: mod.AdminDashboard })), {
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
  ssr: false
})

export const ProductsManager = dynamic(() => import('./admin/products-manager').then(mod => ({ default: mod.ProductsManager })), {
  loading: () => <div>Cargando gestión de productos...</div>,
  ssr: false
})

export const OrdersManager = dynamic(() => import('./admin/orders-manager').then(mod => ({ default: mod.OrdersManager })), {
  loading: () => <div>Cargando gestión de pedidos...</div>,
  ssr: false
})

// ⚡ MERCADOPAGO - Solo carga en checkout
export const MercadoPagoCheckout = dynamic(
  () => import('@mercadopago/sdk-react').then(mod => ({
    default: mod.Payment
  })),
  {
    loading: () => (
      <div className="bg-gray-50 p-8 rounded-lg animate-pulse">
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    ),
    ssr: false
  }
)

// ⚡ CARRITO - Solo carga cuando se abre
export const CartPanel = dynamic(() => import('./shop/cart-panel').then(mod => ({ default: mod.CartPanel })), {
  loading: () => null,
  ssr: false
})

// ⚡ CAROUSEL - Solo en páginas que lo necesiten
// Note: embla-carousel-react exports a hook, not a component, so we won't use dynamic import for it

// ⚡ COMPONENTES RADIX PESADOS - Lazy load
export const Dialog = dynamic(() => import('@radix-ui/react-dialog').then(mod => ({
  default: mod.Root
})), {
  ssr: false
})

export const DropdownMenu = dynamic(() => import('@radix-ui/react-dropdown-menu').then(mod => ({
  default: mod.Root
})), {
  ssr: false
})

export const Toast = dynamic(() => import('@radix-ui/react-toast').then(mod => ({
  default: mod.Root
})), {
  ssr: false
})

// ⚡ COMPONENTES DE PRODUCTO - Para páginas específicas
export const ProductDetailView = dynamic(() => import('./shop/product-detail-view').then(mod => ({ default: mod.ProductDetailView })), {
  loading: () => (
    <div className="space-y-4">
      <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
    </div>
  )
})

export const RelatedProducts = dynamic(() => import('./shop/related-products').then(mod => ({ default: mod.RelatedProducts })), {
  loading: () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
      ))}
    </div>
  )
})

import { ComponentType, useState, useEffect } from 'react'

// ⚡ HOOK para lazy loading condicional
export function useDynamicImport<T = ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  condition: boolean
): T | null {
  const [Component, setComponent] = useState<T | null>(null)

  useEffect(() => {
    if (condition && !Component) {
      factory().then(module => {
        setComponent(module.default)
      })
    }
  }, [condition, Component, factory])

  return Component
}

// ⚡ PRELOAD FUNCTIONS - Para cargar componentes antes de necesitarlos
export const preloadAdminComponents = () => {
  if (typeof window !== 'undefined') {
    // Preload admin components cuando el usuario esté cerca del área admin
    import('./admin/admin-dashboard')
    import('./admin/products-manager')
  }
}

export const preloadCheckoutComponents = () => {
  if (typeof window !== 'undefined') {
    import('@mercadopago/sdk-react')
    import('./shop/cart-panel')
  }
}

// ⚡ INTERSECTION OBSERVER para preload inteligente
export function usePreloadOnScroll(threshold = 0.5) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Si el usuario está cerca del footer, preload componentes del checkout
            if (entry.target.id === 'footer-section') {
              preloadCheckoutComponents()
            }
          }
        })
      },
      { threshold }
    )

    const footer = document.getElementById('footer-section')
    if (footer) {
      observer.observe(footer)
    }

    return () => observer.disconnect()
  }, [threshold])
}