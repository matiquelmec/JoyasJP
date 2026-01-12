import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { AdminAuthProvider } from '@/components/admin/admin-auth-provider'

// ⚡ Dynamic imports para componentes admin pesados - No afectan al cliente
const AdminSidebar = dynamic(
  () => import('@/components/admin/admin-sidebar').then(mod => ({ default: mod.AdminSidebar })),
  {
    loading: () => (
      <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-lg animate-pulse">
        <div className="h-16 bg-gray-200 m-4 rounded"></div>
        <div className="space-y-2 p-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    ),
    ssr: false
  }
)

const AdminHeader = dynamic(
  () => import('@/components/admin/admin-header').then(mod => ({ default: mod.AdminHeader })),
  {
    loading: () => (
      <div className="h-16 bg-white border-b border-gray-200 animate-pulse">
        <div className="flex justify-between items-center h-full px-8">
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    ),
    ssr: false
  }
)

export const metadata: Metadata = {
  title: 'Admin Panel | Joyas JP',
  description: 'Panel de administración para gestión de inventario y ventas',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthProvider>
      <div className="min-h-screen bg-slate-50 admin-panel" data-version="2024-unified">
        <AdminSidebar />
        <div className="lg:pl-72">
          <AdminHeader />
          <main className="p-4 lg:p-8 pb-20 lg:pb-8" style={{ paddingTop: '80px' }}>
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminAuthProvider>
  )
}