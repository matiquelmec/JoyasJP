"use client";

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Eye, 
  Truck, 
  Check, 
  X, 
  Filter,
  Download,
  RefreshCw,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  customer_name: string;
  contact_email: string;
  contact_phone: string;
  shipping_address: string;
  total_amount: number;
  status: string;
  created_at: string;
  ordered_products: any[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error loading orders:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los pedidos",
          variant: "destructive"
        });
        return;
      }

      setOrders((data || []) as unknown as Order[]);
    } catch (error) {
      logger.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.contact_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) {
        logger.error('Error updating order status:', error);
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado del pedido",
          variant: "destructive"
        });
        return;
      }

      // Actualizar localmente
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      toast({
        title: "Estado actualizado",
        description: `Pedido marcado como ${getStatusLabel(newStatus)}`,
        variant: "default"
      });

    } catch (error) {
      logger.error('Error updating order status:', error);
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

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pendiente',
      processing: 'Procesando',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado'
    };
    return labels[status as keyof typeof labels] || status;
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

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Cargando pedidos...</p>
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
            <h1 className="text-3xl font-bold">Gestión de Pedidos</h1>
            <p className="text-muted-foreground">
              {filteredOrders.length} de {orders.length} pedidos
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={loadOrders} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              
              {/* Búsqueda */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, email o ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filtro de estado */}
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="processing">Procesando</SelectItem>
                    <SelectItem value="shipped">Enviados</SelectItem>
                    <SelectItem value="delivered">Entregados</SelectItem>
                    <SelectItem value="cancelled">Cancelados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de pedidos */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No se encontraron pedidos</p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-0">
                  
                  {/* Información principal */}
                  <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-semibold text-lg">{order.customer_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Pedido #{order.id.slice(0, 8)}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {order.contact_email}
                            </div>
                            {order.contact_phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {order.contact_phone}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{formatDate(order.created_at)}</span>
                          <span>{order.ordered_products?.length || 0} productos</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold">{formatCurrency(order.total_amount)}</p>
                          {getStatusBadge(order.status)}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => toggleOrderDetails(order.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          {order.status === 'pending' && (
                            <Button 
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, 'processing')}
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Procesar
                            </Button>
                          )}

                          {order.status === 'processing' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateOrderStatus(order.id, 'shipped')}
                            >
                              <Truck className="w-4 h-4 mr-2" />
                              Enviar
                            </Button>
                          )}

                          {order.status === 'shipped' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateOrderStatus(order.id, 'delivered')}
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Entregar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detalles expandibles */}
                  {expandedOrder === order.id && (
                    <div className="p-6 bg-gray-50 space-y-4">
                      
                      {/* Dirección de envío */}
                      <div>
                        <h4 className="font-medium flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4" />
                          Dirección de Envío
                        </h4>
                        <p className="text-sm text-muted-foreground bg-white p-3 rounded border">
                          {order.shipping_address}
                        </p>
                      </div>

                      {/* Productos */}
                      <div>
                        <h4 className="font-medium mb-2">Productos Pedidos</h4>
                        <div className="space-y-2">
                          {order.ordered_products?.map((product, index) => (
                            <div key={index} className="bg-white p-3 rounded border flex justify-between items-center">
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Cantidad: {product.quantity}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatCurrency(product.price * product.quantity)}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatCurrency(product.price)} c/u
                                </p>
                              </div>
                            </div>
                          )) || (
                            <p className="text-sm text-muted-foreground">No hay productos especificados</p>
                          )}
                        </div>
                      </div>

                      {/* Acciones adicionales */}
                      <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" size="sm">
                          Imprimir
                        </Button>
                        <Button variant="outline" size="sm">
                          Enviar Email
                        </Button>
                        {order.status !== 'cancelled' && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}