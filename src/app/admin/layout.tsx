import type { Metadata } from 'next';
import { AdminErrorBoundary } from '@/components/ui/error-boundary';

export const metadata: Metadata = {
  title: 'Panel Administrativo | Joyas JP',
  description: 'Gestiona tu tienda de joyas - Pedidos, inventario y análisis',
  robots: 'noindex, nofollow', // No indexar páginas de admin
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-layout">
      <AdminErrorBoundary>
        {children}
      </AdminErrorBoundary>
    </div>
  );
}