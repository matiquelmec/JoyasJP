import { Suspense } from 'react'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { DashboardSkeleton } from '@/components/admin/dashboard-skeleton'

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Resumen general de tu negocio de joyería
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <AdminDashboard />
      </Suspense>
    </div>
  )
}