"use client";

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  LogOut, 
  User,
  Settings
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Pedidos',
    href: '/admin/orders',
    icon: ShoppingCart
  },
  {
    name: 'Productos',
    href: '/admin/products',
    icon: Package
  }
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, checkSession, logout, user } = useAdminAuth();

  useEffect(() => {
    if (!isAuthenticated || !checkSession()) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, checkSession, router]);

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  if (!isAuthenticated || !checkSession()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          
          {/* Logo y título */}
          <div className="flex items-center space-x-4">
            <Image
              src="/assets/logo.webp"
              alt="Joyas JP"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <h1 className="text-xl font-bold">Panel de Administración</h1>
              <p className="text-sm text-muted-foreground">Joyas JP</p>
            </div>
          </div>

          {/* Usuario y logout */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <User className="w-4 h-4" />
              <span className="font-medium">{user?.name}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-white shadow-sm border-r">
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Información de sesión */}
          <div className="absolute bottom-4 left-4 right-4">
            <Card>
              <CardContent className="p-3 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Sesión activa</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <p className="mt-1">Válida por 8 horas</p>
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}