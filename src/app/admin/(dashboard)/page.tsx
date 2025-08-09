import { Suspense } from 'react'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { DashboardSkeleton } from '@/components/admin/dashboard-skeleton'

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl -z-10" />
        <div className="p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="mt-3 text-muted-foreground text-lg">
            Resumen general de tu negocio de joyería
          </p>
        </div>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <AdminDashboard />
      </Suspense>
    </div>
  )
}