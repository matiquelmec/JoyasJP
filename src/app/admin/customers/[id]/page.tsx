'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, ShoppingBag, CreditCard, TrendingUp, Package } from 'lucide-react';
import Link from 'next/link';

interface CustomerDetails {
  id: string;
  email: string;
  phone: string | null;
  first_name: string;
  last_name: string;
  city: string | null;
  region: string | null;
  address: string | null;
  created_at: string;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

interface CustomerStats {
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  last_order_date: string | null;
  favorite_category: string | null;
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (customerId) {
      fetchCustomerData();
    }
  }, [customerId]);

  const fetchCustomerData = async () => {
    if (!supabase) {
      console.error('Supabase not initialized');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Obtener datos del cliente
      const { data: customerData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', customerId)
        .single();

      if (customerData) {
        setCustomer(customerData as unknown as CustomerDetails);
      } else {
        router.push('/admin/customers');
        return;
      }

      // Por ahora solo obtener pedidos básicos
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', customerId)
        .order('created_at', { ascending: false });

      if (ordersData) {
        const formattedOrders = ordersData.map(order => ({
          ...order,
          items: [] // Simplificamos por ahora
        }));
        setOrders(formattedOrders as unknown as Order[]);
        
        // Calcular estadísticas básicas
        const totalOrders = ordersData.length;
        const totalSpent = ordersData.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
        const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
        const lastOrderDate = ordersData.length > 0 ? String(ordersData[0].created_at) : null;
        
        setStats({
          total_orders: totalOrders,
          total_spent: totalSpent,
          average_order_value: averageOrderValue,
          last_order_date: lastOrderDate,
          favorite_category: null
        });
      }

    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'Pendiente', variant: 'secondary' as const },
      'confirmed': { label: 'Confirmado', variant: 'default' as const },
      'processing': { label: 'Procesando', variant: 'default' as const },
      'shipped': { label: 'Enviado', variant: 'default' as const },
      'delivered': { label: 'Entregado', variant: 'default' as const },
      'cancelled': { label: 'Cancelado', variant: 'destructive' as const }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'Pendiente', variant: 'secondary' as const },
      'paid': { label: 'Pagado', variant: 'default' as const },
      'failed': { label: 'Fallido', variant: 'destructive' as const },
      'refunded': { label: 'Reembolsado', variant: 'outline' as const }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Cliente no encontrado</h1>
        <Button asChild>
          <Link href="/admin/customers">Volver a clientes</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/customers">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {customer.first_name} {customer.last_name}
          </h1>
          <p className="text-muted-foreground">
            Cliente desde {formatDate(customer.created_at)}
          </p>
        </div>
      </div>

      {/* Información del cliente */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Información de Contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{customer.email}</p>
            </div>
            {customer.phone && (
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p className="font-medium">{customer.phone}</p>
              </div>
            )}
            {customer.city && (
              <div>
                <p className="text-sm text-muted-foreground">Ubicación</p>
                <p className="font-medium">{customer.city}, {customer.region}</p>
              </div>
            )}
            {customer.address && (
              <div>
                <p className="text-sm text-muted-foreground">Dirección</p>
                <p className="font-medium">{customer.address}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Estadísticas de Compra
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Total de Pedidos</p>
              <p className="text-2xl font-bold">{stats?.total_orders || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Gastado</p>
              <p className="text-2xl font-bold">{formatCurrency(stats?.total_spent || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Promedio por Pedido</p>
              <p className="text-xl font-semibold">{formatCurrency(stats?.average_order_value || 0)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Último Pedido</p>
              <p className="font-medium">
                {stats?.last_order_date 
                  ? formatDate(stats.last_order_date)
                  : 'Sin pedidos'
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estado</p>
              <Badge variant={stats?.total_orders && stats.total_orders > 0 ? 'default' : 'secondary'}>
                {stats?.total_orders && stats.total_orders > 0 ? 'Cliente Activo' : 'Sin Compras'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historial de pedidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Historial de Pedidos
          </CardTitle>
          <CardDescription>
            {orders.length} pedidos en total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">Pedido #{order.id.slice(-8)}</h3>
                        {getStatusBadge(order.status)}
                        {getPaymentStatusBadge(order.payment_status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{formatCurrency(order.total_amount)}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Productos:</h4>
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span>
                          {item.quantity}x {item.product_name}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end mt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/orders/${order.id}`}>
                        Ver detalles
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Este cliente aún no ha realizado ningún pedido
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}