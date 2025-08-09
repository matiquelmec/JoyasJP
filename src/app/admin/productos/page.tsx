import { Suspense } from 'react'
import { ProductsManager } from '@/components/admin/products-manager'

export default function ProductsPage() {
  return (
    <div className="space-y-8">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl -z-10" />
        <div className="p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
            Gestión de Productos
          </h1>
          <p className="mt-3 text-muted-foreground text-lg">
            Administra tu inventario y stock de joyas
          </p>
        </div>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Cargando productos...</div>
        </div>
      }>
        <ProductsManager />
      </Suspense>
    </div>
  )
}