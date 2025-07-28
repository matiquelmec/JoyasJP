import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Panel de Administración - Joyas JP',
  description: 'Panel de administración para gestionar pedidos y productos de Joyas JP',
  robots: 'noindex, nofollow', // Evitar indexación en buscadores
};

interface AdminRootLayoutProps {
  children: ReactNode;
}

export default function AdminRootLayout({ children }: AdminRootLayoutProps) {
  return (
    <div className="admin-panel">
      {children}
    </div>
  );
}