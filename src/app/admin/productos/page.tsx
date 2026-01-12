import { Suspense } from 'react'
import { ProductsManager } from '@/components/admin/products-manager'

export default function ProductsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Gestión de Productos
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Administra tu inventario y stock de joyas
        </p>
      </div>

      <Suspense fallback={<div>Cargando productos...</div>}>
        <ProductsManager />
      </Suspense>
    </div>
  )
}