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
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  ShoppingBag,
  Plus,
  AlertCircle,
  Eye,
  Phone,
  MapPin,
  Mail,
  User
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

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
  payment_detail?: string
}

import { toast } from 'sonner'
// ... imports

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
      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': 'Bearer joyasjp2024'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      } else {
        setOrders([])
      }
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
    setUpdatingId(orderId)
    const toastId = toast.loading('Actualizando estado...')

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
        await fetchOrders()
        toast.success(`Estado actualizado a: ${newStatus}`, { id: toastId })
      } else {
        toast.error('Error al actualizar estado', { id: toastId })
      }
    } catch (error) {
      toast.error('Error de conexión', { id: toastId })
    } finally {
      setUpdatingId(null)
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
                          {/* 🚨 Alerta de Error de Stock */}
                          {order.payment_detail?.includes('ERROR') && (
                            <div className="mt-1 flex items-center text-[10px] font-bold text-red-600 bg-red-100 px-1 py-0.5 rounded border border-red-200">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              ERROR STOCK
                            </div>
                          )}
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
                        {order.status === 'pending' && order.payment_status === 'paid' && (
                          <div className="mt-1 text-[10px] text-green-600 font-semibold flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            PAGO CONFIRMADO
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {/* Selector de Estado Profesional */}
                          <Select
                            defaultValue={order.status}
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
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

                          {/* Botón Detalles */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setSelectedOrder(order)} title="Ver Detalles">
                                <Eye className="w-4 h-4 text-slate-500" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Detalles del Pedido #{order.id.slice(0, 8)}</DialogTitle>
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
                                    <p><span className="text-muted-foreground mr-2">Nombre:</span> {order.customer_name}</p>
                                    <p><span className="text-muted-foreground mr-2">Email:</span> {order.customer_email}</p>
                                    <p><span className="text-muted-foreground mr-2">Teléfono:</span> {order.customer_phone || 'No registrado'}</p>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <h4 className="font-semibold flex items-center gap-2">
                                    <MapPin className="w-4 h-4" /> Dirección de Envío
                                  </h4>
                                  <div className="text-sm space-y-1">
                                    {order.shipping_address ? (
                                      <>
                                        <p>{order.shipping_address}</p>
                                        <p>{order.shipping_commune}, {order.shipping_city}</p>
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
                                  {JSON.parse(order.items).map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-4 bg-muted/40 p-2 rounded-lg">
                                      <div className="relative w-12 h-12 rounded overflow-hidden bg-background border">
                                        {item.imageUrl && (
                                          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-sm">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">Cantidad: {item.quantity}</p>
                                      </div>
                                      <p className="font-semibold text-sm">{formatCLP(item.price * item.quantity)}</p>
                                    </div>
                                  ))}
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t mt-4">
                                  <p className="font-medium text-muted-foreground">Total Pagado</p>
                                  <p className="text-xl font-bold font-headline">{formatCLP(order.total_amount)}</p>
                                </div>

                                {order.payment_status && (
                                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md text-xs font-mono text-blue-800 dark:text-blue-200 overflow-x-auto">
                                    Payment ID: {order.payment_id} | Status: {order.payment_status}
                                    {order.payment_detail && <div className="mt-1 font-bold text-red-600">{order.payment_detail}</div>}
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
                Gestión de Estados (Nuevo):
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Usa el selector para cambiar el estado libremente. Puedes revertir cambios si es necesario.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}