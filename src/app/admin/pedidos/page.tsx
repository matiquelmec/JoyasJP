import { Suspense } from 'react'
import { OrdersManager } from '@/components/admin/orders-manager'

export default function OrdersPage() {
  return (
    <div className="space-y-8">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl -z-10" />
        <div className="p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
            Gestión de Pedidos
          </h1>
          <p className="mt-3 text-muted-foreground text-lg">
            Administra pedidos, envíos y seguimiento de órdenes
          </p>
        </div>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Cargando pedidos...</div>
        </div>
      }>
        <OrdersManager />
      </Suspense>
    </div>
  )
}