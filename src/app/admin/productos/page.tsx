import { Suspense } from 'react'
import { ProductsManager } from '@/components/admin/products-manager'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function ProductsPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestión de Productos
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Administra tu inventario y stock de joyas
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      <Suspense fallback={<div>Cargando productos...</div>}>
        <ProductsManager />
      </Suspense>
    </div>
  )
}