import { Suspense } from 'react'
import { OrdersManager } from '@/components/admin/orders-manager'

export default function OrdersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Gestión de Pedidos
        </h1>
        <p className="mt-2 text-slate-600 font-medium">
          Administra pedidos, envíos y seguimiento de órdenes
        </p>
      </div>

      <Suspense fallback={<div>Cargando pedidos...</div>}>
        <OrdersManager />
      </Suspense>
    </div>
  )
}