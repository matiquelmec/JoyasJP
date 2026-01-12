'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  ShoppingBag,
  Plus,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

interface Order {
  id: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  shipping_address?: string
  shipping_city?: string
  shipping_commune?: string
  created_at: string
  updated_at: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  shipping_cost: number
  items: string // JSON string
  payment_id?: string
  payment_status?: string
}

export function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': 'Bearer joyasjp2024'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      } else {
        // console.error('Error fetching orders:', response.statusText)
        setOrders([])
      }
    } catch (error) {
      // console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusStats = () => {
    return {
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    }
  }

  const stats = getStatusStats()
  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, order) => sum + order.total_amount, 0)

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer joyasjp2024'
        },
        body: JSON.stringify({
          orderId,
          status: newStatus
        })
      })

      if (response.ok) {
        // Refresh orders after update
        fetchOrders()
      } else {
        // console.error('Error updating order status:', response.statusText)
      }
    } catch (error) {
      // console.error('Error updating order status:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Cargando pedidos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas de pedidos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Pendientes</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Procesando</p>
                <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Truck className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Enviados</p>
                <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Entregados</p>
                <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm font-medium">Ingresos Total</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCLP(totalRevenue)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estado sin pedidos */}
      {orders.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No hay pedidos aún</h3>
            <p className="text-slate-600 font-medium text-center max-w-md mb-6">
              Los pedidos aparecerán aquí cuando los clientes realicen compras en tu tienda.
              Mientras tanto, asegúrate de tener productos disponibles.
            </p>
            <div className="flex gap-3">
              <Link href="/admin/productos">
                <Button>
                  <Package className="w-4 h-4 mr-2" />
                  Ver Productos
                </Button>
              </Link>
              <Link href="/shop">
                <Button variant="outline">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Ir a la Tienda
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de pedidos */}
      {orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const orderItems = JSON.parse(order.items)
                  const itemCount = orderItems.reduce((sum: number, item: any) => sum + item.quantity, 0)

                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">
                        {order.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customer_name}</p>
                          <p className="text-xs text-slate-500 font-medium">{order.customer_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString('es-CL')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{formatCLP(order.total_amount)}</p>
                          <p className="text-xs text-slate-500 font-medium">{itemCount} items</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === 'delivered' ? 'default' :
                              order.status === 'cancelled' ? 'destructive' :
                                order.status === 'processing' ? 'secondary' :
                                  'outline'
                          }
                        >
                          {order.status === 'pending' && 'Pendiente'}
                          {order.status === 'processing' && 'Procesando'}
                          {order.status === 'shipped' && 'Enviado'}
                          {order.status === 'delivered' && 'Entregado'}
                          {order.status === 'cancelled' && 'Cancelado'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {order.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOrderStatus(order.id, 'processing')}
                            >
                              <Package className="w-4 h-4 mr-1" />
                              Procesar
                            </Button>
                          )}
                          {order.status === 'processing' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOrderStatus(order.id, 'shipped')}
                            >
                              <Truck className="w-4 h-4 mr-1" />
                              Enviar
                            </Button>
                          )}
                          {order.status === 'shipped' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOrderStatus(order.id, 'delivered')}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Entregar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Información sobre el sistema de pedidos */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <AlertCircle className="h-5 w-5" />
            Sistema de Pedidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-blue-700 dark:text-blue-300 space-y-2">
            <p className="text-sm">
              <strong>Sistema de Pedidos Conectado:</strong> ✅ Completamente funcional
            </p>
            <ul className="text-sm list-disc list-inside space-y-1 ml-4">
              <li>✅ Checkout guarda pedidos automáticamente en la base de datos</li>
              <li>✅ Datos del cliente y productos se almacenan en Supabase</li>
              <li>✅ Estados de pedidos se pueden actualizar desde el admin</li>
              <li>✅ Estadísticas e ingresos se calculan en tiempo real</li>
              <li>✅ Integración completa con MercadoPago</li>
            </ul>
            <div className="mt-4 p-3 bg-white dark:bg-gray-900 rounded-lg border">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Estados de pedidos disponibles:
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Pendiente → Procesando → Enviado → Entregado | Cancelado
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}