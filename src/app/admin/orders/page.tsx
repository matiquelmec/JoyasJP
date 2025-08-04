'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase-client'
import {
  Package,
  Search,
  ArrowLeft,
  Eye,
  Edit,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Calendar,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

interface Order {
  id: string
  customer_name: string
  contact_email: string
  contact_phone?: string
  shipping_address: string
  total_amount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  payment_status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  ordered_products: OrderProduct[]
  tracking_number?: string
  notes?: string
}

interface OrderProduct {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)

  const { toast } = useToast()

  const fetchOrders = async () => {
    if (!supabase) return

    setLoading(true)
    try {
      const { data, error } = (await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })) as {
        data: Order[] | null
        error: any
      }

      if (error) {
        console.error('Error fetching orders:', error)
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los pedidos',
          variant: 'destructive',
        })
      } else {
        setOrders(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const updateOrderStatus = async (
    orderId: string,
    newStatus: string,
    trackingNumber?: string,
    notes?: string
  ) => {
    if (!supabase) return

    setUpdatingOrder(orderId)
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      }

      if (trackingNumber) updateData.tracking_number = trackingNumber
      if (notes) updateData.notes = notes

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)

      if (error) {
        console.error('Error updating order:', error)
        toast({
          title: 'Error',
          description: 'No se pudo actualizar el pedido',
          variant: 'destructive',
        })
      } else {
        setOrders(
          orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: newStatus as any,
                  tracking_number: trackingNumber,
                  notes: notes,
                }
              : order
          )
        )
        toast({
          title: 'Pedido actualizado',
          description: `Estado cambiado a: ${getStatusLabel(newStatus)}`,
        })
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setUpdatingOrder(null)
    }
  }

  const getStatusLabel = (status: string) => {
    const statusLabels = {
      pending: 'Pendiente',
      processing: 'Procesando',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    }
    return statusLabels[status as keyof typeof statusLabels] || status
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendiente', variant: 'default' as const, icon: Clock },
      processing: {
        label: 'Procesando',
        variant: 'secondary' as const,
        icon: Package,
      },
      shipped: { label: 'Enviado', variant: 'outline' as const, icon: Truck },
      delivered: {
        label: 'Entregado',
        variant: 'secondary' as const,
        icon: CheckCircle,
      },
      cancelled: {
        label: 'Cancelado',
        variant: 'destructive' as const,
        icon: XCircle,
      },
    }

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const IconComponent = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getPaymentBadge = (status: string) => {
    const config = {
      pending: { label: 'Pendiente', variant: 'default' as const },
      approved: { label: 'Aprobado', variant: 'secondary' as const },
      rejected: { label: 'Rechazado', variant: 'destructive' as const },
    }

    const paymentConfig =
      config[status as keyof typeof config] || config.pending
    return <Badge variant={paymentConfig.variant}>{paymentConfig.label}</Badge>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.contact_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter
    const matchesPayment =
      paymentFilter === 'all' || order.payment_status === paymentFilter

    return matchesSearch && matchesStatus && matchesPayment
  })

  const OrderStatusUpdater = ({ order }: { order: Order }) => {
    const [newStatus, setNewStatus] = useState(order.status)
    const [trackingNumber, setTrackingNumber] = useState(
      order.tracking_number || ''
    )
    const [notes, setNotes] = useState(order.notes || '')
    const [isOpen, setIsOpen] = useState(false)

    const handleUpdate = () => {
      updateOrderStatus(order.id, newStatus, trackingNumber, notes)
      setIsOpen(false)
    }

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <Edit className="h-3 w-3 mr-1" />
            Editar
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizar Pedido #{order.id.slice(0, 8)}</DialogTitle>
            <DialogDescription>
              Modifica el estado y detalles del pedido
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Estado del Pedido</Label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="processing">Procesando</SelectItem>
                  <SelectItem value="shipped">Enviado</SelectItem>
                  <SelectItem value="delivered">Entregado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Número de Seguimiento</Label>
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Ej: CH123456789CL"
              />
            </div>

            <div className="space-y-2">
              <Label>Notas Internas</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas sobre el pedido..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updatingOrder === order.id}
            >
              {updatingOrder === order.id ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const OrderDetailDialog = ({ order }: { order: Order }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <Eye className="h-3 w-3 mr-1" />
            Ver
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Detalles del Pedido #{order.id.slice(0, 8)}
            </DialogTitle>
            <DialogDescription>
              Información completa del pedido
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    Información del Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{order.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{order.contact_email}</span>
                  </div>
                  {order.contact_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{order.contact_phone}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Estado del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    {getPaymentBadge(order.payment_status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Shipping */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Dirección de Envío</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <span className="text-sm">{order.shipping_address}</span>
                </div>
                {order.tracking_number && (
                  <div className="flex items-center gap-2 mt-2">
                    <Truck className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      Tracking: {order.tracking_number}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Products */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Productos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {order.ordered_products?.map((product, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {product.product_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Cantidad: {product.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">
                          {formatCurrency(product.total_price)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(product.unit_price)} c/u
                        </p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-gray-500">
                      No hay productos registrados
                    </p>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t font-medium">
                    <span>Total:</span>
                    <span className="text-lg">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {order.notes && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Notas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Gestión de Pedidos
                </h1>
                <p className="text-gray-600">
                  Administra todos los pedidos de tu tienda
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={fetchOrders}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Pedidos</p>
                  <p className="text-2xl font-bold">{orders.length}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold">
                    {orders.filter((o) => o.status === 'pending').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Enviados</p>
                  <p className="text-2xl font-bold">
                    {orders.filter((o) => o.status === 'shipped').length}
                  </p>
                </div>
                <Truck className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ingresos</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(
                      orders.reduce((sum, order) => sum + order.total_amount, 0)
                    )}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-10"
                    placeholder="Buscar por cliente, email o ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="processing">Procesando</SelectItem>
                    <SelectItem value="shipped">Enviado</SelectItem>
                    <SelectItem value="delivered">Entregado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Pago</Label>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="approved">Aprobado</SelectItem>
                    <SelectItem value="rejected">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos ({filteredOrders.length})</CardTitle>
            <CardDescription>
              Lista completa de todos los pedidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 animate-pulse text-gray-400" />
                <p className="mt-2 text-gray-500">Cargando pedidos...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {orders.length === 0
                    ? 'No hay pedidos'
                    : 'No se encontraron pedidos'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {orders.length === 0
                    ? 'Los pedidos aparecerán aquí cuando los clientes realicen compras.'
                    : 'Prueba ajustando los filtros de búsqueda.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Pago</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              #{order.id.slice(0, 8)}
                            </p>
                            {order.tracking_number && (
                              <p className="text-xs text-gray-500">
                                {order.tracking_number}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.customer_name}</p>
                            <p className="text-sm text-gray-500">
                              {order.contact_email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(order.total_amount)}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          {getPaymentBadge(order.payment_status)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <OrderDetailDialog order={order} />
                            <OrderStatusUpdater order={order} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
