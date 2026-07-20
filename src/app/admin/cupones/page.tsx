import { Suspense } from 'react'
import { CouponsManager } from '@/components/admin/coupons-manager'

export default function CouponsAdminPage() {
  return (
    <div className="space-y-8">
      <Suspense fallback={<div>Cargando administrador de cupones...</div>}>
        <CouponsManager />
      </Suspense>
    </div>
  )
}
