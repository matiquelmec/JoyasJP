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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  ShoppingBag,
  AlertCircle,
  Eye,
  MapPin,
  User,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { adminAPI } from '@/lib/admin-api'
import { toast } from 'sonner'

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
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  shipping_cost: number
  items: any
  payment_id?: string
  payment_status?: string
  payment_detail?: string
}

export function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const data = await adminAPI.getOrders()
      setOrders(data || [])
    } catch (error) {
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
      pending: orders.filter(o => o.status === 'pending' || o.payment_status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    }
  }

  const stats = getStatusStats()
  const totalRevenue = orders
    .filter(o => o.payment_status === 'paid' || o.payment_status === 'approved' || o.status === 'delivered')
    .reduce((sum, order) => sum + order.total_amount, 0)

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId)
    const toastId = toast.loading('Actualizando estado...')

    try {
      await adminAPI.updateOrderStatus(orderId, newStatus)
      await fetchOrders()
      toast.success(`Estado actualizado a: ${newStatus}`, { id: toastId })
    } catch (error) {
      toast.error('Error al actualizar estado', { id: toastId })
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground uppercase font-black tracking-widest text-xs animate-pulse">
          Cargando pedidos...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
              <p className="text-sm font-medium">Ingresos Totales</p>
              <p className="text-2xl font-bold text-green-600">{formatCLP(totalRevenue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {orders.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No hay pedidos aún</h3>
            <p className="text-slate-600 font-medium text-center max-w-md mb-6">
              Los pedidos aparecerán aquí cuando los clientes completen compras en la tienda.
            </p>
            <div className="flex gap-3">
              <Link href="/admin/productos">
                <Button>
                  <Package className="w-4 h-4 mr-2" />
                  Ver Catálogo
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Pedidos</CardTitle>
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
                {orders.map(order => {
                  const orderItems = Array.isArray(order.items)
                    ? order.items
                    : typeof order.items === 'string'
                      ? JSON.parse(order.items)
                      : []
                  const itemCount = orderItems.reduce(
                    (sum: number, item: any) => sum + (item.quantity || 1),
                    0
                  )

                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">
                        {order.id.slice(0, 10)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{order.customer_name}</p>
                          <p className="text-xs text-slate-500 font-medium">{order.customer_email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {new Date(order.created_at).toLocaleDateString('es-CL')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{formatCLP(order.total_amount)}</p>
                          <p className="text-xs text-slate-500 font-medium mb-1">{itemCount} items</p>

                          <div className="flex flex-col gap-1">
                            {order.payment_status === 'paid' || order.payment_status === 'approved' ? (
                              <Badge
                                variant="outline"
                                className="w-fit bg-green-50 text-green-700 border-green-200 text-[10px] px-2 py-0 h-5 font-semibold"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                PAGADO
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="w-fit bg-slate-100 text-slate-600 border-slate-200 text-[10px] px-2 py-0 h-5"
                              >
                                <Clock className="w-3 h-3 mr-1" />
                                PENDIENTE
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === 'delivered' || order.status === 'paid'
                              ? 'default'
                              : order.status === 'cancelled'
                                ? 'destructive'
                                : 'outline'
                          }
                          className={
                            order.status === 'paid' ? 'bg-green-600 hover:bg-green-700' : ''
                          }
                        >
                          {order.status === 'pending' && 'Pendiente'}
                          {order.status === 'paid' && 'Pagado'}
                          {order.status === 'processing' && 'Procesando'}
                          {order.status === 'shipped' && 'Enviado'}
                          {order.status === 'delivered' && 'Entregado'}
                          {order.status === 'cancelled' && 'Cancelado'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            defaultValue={order.status}
                            onValueChange={value => updateOrderStatus(order.id, value)}
                            disabled={updatingId === order.id}
                          >
                            <SelectTrigger className="w-[130px] h-8 text-xs">
                              <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">
                                <div className="flex items-center">
                                  <Clock className="w-3 h-3 mr-2 text-orange-600" /> Pendiente
                                </div>
                              </SelectItem>
                              <SelectItem value="paid">
                                <div className="flex items-center">
                                  <CheckCircle className="w-3 h-3 mr-2 text-green-600" /> Pagado
                                </div>
                              </SelectItem>
                              <SelectItem value="processing">
                                <div className="flex items-center">
                                  <Package className="w-3 h-3 mr-2 text-blue-600" /> Procesando
                                </div>
                              </SelectItem>
                              <SelectItem value="shipped">
                                <div className="flex items-center">
                                  <Truck className="w-3 h-3 mr-2 text-purple-600" /> Enviado
                                </div>
                              </SelectItem>
                              <SelectItem value="delivered">
                                <div className="flex items-center">
                                  <CheckCircle className="w-3 h-3 mr-2 text-green-600" /> Entregado
                                </div>
                              </SelectItem>
                              <SelectItem value="cancelled">
                                <div className="flex items-center">
                                  <XCircle className="w-3 h-3 mr-2 text-red-600" /> Cancelado
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => setSelectedOrder(order)}
                                title="Ver Detalles"
                              >
                                <Eye className="w-4 h-4 text-slate-500" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Detalles del Pedido #{order.id}</DialogTitle>
                                <DialogDescription>
                                  Creado el {new Date(order.created_at).toLocaleString('es-CL')}
                                </DialogDescription>
                              </DialogHeader>

                              <div className="grid grid-cols-2 gap-6 py-4">
                                <div className="space-y-4">
                                  <h4 className="font-semibold flex items-center gap-2">
                                    <User className="w-4 h-4" /> Datos del Cliente
                                  </h4>
                                  <div className="text-sm space-y-1">
                                    <p>
                                      <span className="text-muted-foreground mr-2">Nombre:</span>
                                      {order.customer_name}
                                    </p>
                                    <p>
                                      <span className="text-muted-foreground mr-2">Email:</span>{' '}
                                      {order.customer_email}
                                    </p>
                                    <p>
                                      <span className="text-muted-foreground mr-2">Teléfono:</span>{' '}
                                      {order.customer_phone || 'No registrado'}
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <h4 className="font-semibold flex items-center gap-2">
                                    <MapPin className="w-4 h-4" /> Despacho
                                  </h4>
                                  <div className="text-sm space-y-1">
                                    {order.shipping_address ? (
                                      <>
                                        <p>{order.shipping_address}</p>
                                        <p>
                                          {order.shipping_commune}, {order.shipping_city}
                                        </p>
                                      </>
                                    ) : (
                                      <p className="text-muted-foreground italic">No especificada</p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4 border-t pt-4">
                                <h4 className="font-semibold flex items-center gap-2">
                                  <ShoppingBag className="w-4 h-4" /> Productos ({itemCount})
                                </h4>
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                  {orderItems.map((item: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-4 bg-muted/40 p-2 rounded-lg"
                                    >
                                      <div className="relative w-12 h-12 rounded overflow-hidden bg-background border">
                                        <Image
                                          src={item.imageUrl || '/assets/logo.webp'}
                                          alt={item.name}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-sm">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          Cantidad: {item.quantity}
                                        </p>
                                      </div>
                                      <p className="font-semibold text-sm">
                                        {formatCLP(item.price * item.quantity)}
                                      </p>
                                    </div>
                                  ))}
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t mt-4">
                                  <p className="font-medium text-muted-foreground">Total de la Orden</p>
                                  <p className="text-xl font-bold font-headline">
                                    {formatCLP(order.total_amount)}
                                  </p>
                                </div>

                                {order.payment_detail && (
                                  <div className="bg-slate-100 p-2 rounded text-xs font-mono text-slate-700">
                                    {order.payment_detail}
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
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
    </div>
  )
}
