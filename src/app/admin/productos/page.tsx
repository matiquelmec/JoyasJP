import { Suspense } from 'react'
import { ProductsManager } from '@/components/admin/products-manager'

export default function ProductsPage() {
  return (
    <div className="space-y-8">

      <Suspense fallback={<div>Cargando productos...</div>}>
        <ProductsManager />
      </Suspense>
    </div>
  )
}