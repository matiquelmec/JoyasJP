"use client";

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import AdminLayout from '@/components/admin/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Clock,
  Eye
} from 'lucide-react';

// Dynamic imports para componentes pesados
const DashboardStats = dynamic(() => import('@/components/admin/dashboard-stats'), {
  loading: () => <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(4)].map((_, i) => (
      <Card key={i} className="animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-4 bg-muted rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-muted rounded mb-2" />
          <div className="h-3 bg-muted rounded" />
        </CardContent>
      </Card>
    ))}
  </div>,
  ssr: false
});
import { supabase } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockProducts: number;
}

interface RecentOrder {
  id: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
  ordered_products: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    lowStockProducts: 0
  });
  
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      if (!supabase) {
        logger.error('Supabase client is not initialized.');
        setIsLoading(false);
        return;
      }

      // Cargar estadísticas de pedidos
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*');

      if (ordersError) {
        logger.error('Error loading orders:', ordersError);
      }

      // Cargar productos
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) {
        logger.error('Error loading products:', productsError);
      }

      // Calcular estadísticas
      if (orders && products) {
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(order => order.status === 'pending').length;
        const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
        const totalProducts = products.length;
        const lowStockProducts = products.filter(product => Number(product.stock) < 5).length;

        setStats({
          totalOrders,
          pendingOrders,
          totalRevenue,
          totalProducts,
          lowStockProducts
        });

        // Pedidos recientes (últimos 10)
        const sortedOrders = orders
          .sort((a, b) => new Date(String(b.created_at)).getTime() - new Date(String(a.created_at)).getTime())
          .slice(0, 10) as unknown as RecentOrder[];
        
        setRecentOrders(sortedOrders);
      }

    } catch (error) {
      logger.error('Error loading dashboard data:', error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendiente', variant: 'secondary' as const },
      processing: { label: 'Procesando', variant: 'default' as const },
      shipped: { label: 'Enviado', variant: 'outline' as const },
      delivered: { label: 'Entregado', variant: 'default' as const },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Cargando dashboard...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Panel de control y estadísticas de Joyas JP
            </p>
          </div>
          <Button onClick={loadDashboardData} variant="outline">
            Actualizar
          </Button>
        </div>

        {/* Estadísticas principales */}
        <Suspense fallback={<div className="animate-pulse h-48 bg-muted rounded" />}>
          <DashboardStats stats={stats} />
        </Suspense>

        {/* Pedidos recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pedidos Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay pedidos registrados
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{order.customer_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm text-muted-foreground">
                        {order.ordered_products?.length || 0} productos
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(order.total_amount)}</p>
                        {getStatusBadge(order.status)}
                      </div>
                      
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Acciones rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-20 flex-col space-y-2" variant="outline">
                <Clock className="w-6 h-6" />
                <span>Ver Pedidos</span>
              </Button>
              
              <Button className="h-20 flex-col space-y-2" variant="outline">
                <Eye className="w-6 h-6" />
                <span>Gestionar Stock</span>
              </Button>
              
              <Button className="h-20 flex-col space-y-2" variant="outline">
                <TrendingUp className="w-6 h-6" />
                <span>Reportes</span>
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </AdminLayout>
  );
}