'use client'

import { useState, useEffect, useCallback } from 'react'
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
  RefreshCw,
  CreditCard,
  MessageCircle,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { adminAPI } from '@/lib/admin-api'
import type { NormalizedPaymentDetail } from '@/lib/validations/admin'
import { toast } from 'sonner'

interface Order {
  id: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  shipping_address?: string
  shipping_city?: string
  shipping_commune?: string
  shipping_method?: string
  delivery_method?: string
  coupon_code?: string | null
  discount_amount?: number
  created_at: string
  updated_at?: string
  status: 'pending' | 'paid' | 'approved' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  shipping_cost?: number
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
    imageUrl?: string
  }>
  payment_id?: string
  payment_status?: string
  payment_detail?: NormalizedPaymentDetail | string | null
}

function OrdersManagerSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Cargando pedidos">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Card key={idx} className="overflow-hidden border-slate-200 bg-white">
            <CardContent className="p-4 space-y-3 relative">
              <div className="h-3 w-20 rounded bg-slate-200 animate-pulse" />
              <div className="h-7 w-24 rounded bg-slate-200 animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/60 to-transparent animate-shimmer pointer-events-none" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden border-slate-200 bg-white">
        <CardHeader className="border-b border-slate-100">
          <div className="h-6 w-48 rounded bg-slate-200 animate-pulse" />
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0"
            >
              <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
              <div className="space-y-2 flex-1 max-w-xs">
                <div className="h-4 w-40 rounded bg-slate-200 animate-pulse" />
                <div className="h-3 w-52 rounded bg-slate-100 animate-pulse" />
              </div>
              <div className="h-4 w-20 rounded bg-slate-200 animate-pulse" />
              <div className="h-6 w-24 rounded-full bg-slate-200 animate-pulse" />
              <div className="h-8 w-32 rounded bg-slate-200 animate-pulse" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function renderPaymentDetailSummary(detail: Order['payment_detail']): string | null {
  if (!detail) return null
  if (typeof detail === 'string') return detail
  if (typeof detail === 'object') {
    const parts: string[] = []
    if (detail.flowOrder) parts.push(`Orden Flow #${detail.flowOrder}`)
    if (detail.media) parts.push(`Medio: ${detail.media}`)
    if (detail.trackingNumber) parts.push(`Seguimiento: ${detail.trackingNumber}`)
    if (detail.paidAt) parts.push(`Fecha pago: ${detail.paidAt}`)
    return parts.length > 0 ? parts.join(' • ') : detail.raw || null
  }
  return String(detail)
}

function buildCustomerWhatsappUrl(phone?: string, orderId?: string, customerName?: string): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 8) return null
  const normalized = digits.startsWith('56') ? digits : `56${digits.replace(/^0+/, '')}`
  const text = encodeURIComponent(
    `Hola ${customerName || ''}! 👋 Te escribimos de Joyas JP respecto a tu pedido #${orderId || ''} para coordinar la entrega.`
  )
  return `https://wa.me/${normalized}?text=${text}`
}

export function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchOrders = useCallback(async (isSilentRefresh = false) => {
    if (isSilentRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const data = await adminAPI.getOrders()
      setOrders(Array.isArray(data) ? data : [])
    } catch (err: any) {
      const message =
        err?.message || 'No se pudieron recuperar los pedidos desde Turso DB.'
      setError(message)
      toast.error('Error al cargar pedidos', { description: message })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(Number(amount || 0))
  }

  const stats = {
    pending: orders.filter((o) => o.status === 'pending').length,
    paid: orders.filter((o) => o.status === 'paid' || o.status === 'approved').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  }

  const isOrderApproved = (o: Order) =>
    o.payment_status === 'paid' ||
    o.payment_status === 'approved' ||
    o.status === 'paid' ||
    o.status === 'approved' ||
    o.status === 'delivered'

  const totalRevenue = orders
    .filter(isOrderApproved)
    .reduce((sum, order) => sum + Number(order.total_amount || 0), 0)

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId)
    const toastId = toast.loading('Actualizando estado del pedido...')

    try {
      await adminAPI.updateOrderStatus(orderId, newStatus)
      await fetchOrders(true)
      toast.success(`Pedido actualizado a "${newStatus}"`, { id: toastId })
    } catch (err: any) {
      toast.error('Error al actualizar estado', {
        id: toastId,
        description: err?.message || 'Intenta nuevamente.',
      })
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return <OrdersManagerSkeleton />
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50/70 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-red-950 uppercase tracking-tight mb-2">
            Error sincronizando los pedidos
          </h3>
          <p className="text-sm text-red-800 max-w-md mb-6 font-medium">{error}</p>
          <Button
            onClick={() => fetchOrders()}
            className="min-h-[44px] bg-red-600 hover:bg-red-700 text-white font-bold gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar conexión
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="gap-2 bg-white border-slate-200 text-slate-700 font-semibold h-9"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Sincronizando...' : 'Actualizar pedidos'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-600 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Pendientes
                </p>
                <p className="text-2xl font-black text-orange-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-emerald-200 ring-1 ring-emerald-500/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Pagados
                </p>
                <p className="text-2xl font-black text-emerald-600">{stats.paid}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-blue-600 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Procesando
                </p>
                <p className="text-2xl font-black text-blue-600">{stats.processing}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Truck className="h-4 w-4 text-purple-600 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Enviados
                </p>
                <p className="text-2xl font-black text-purple-600">{stats.shipped}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Entregados
                </p>
                <p className="text-2xl font-black text-green-600">{stats.delivered}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Ingresos Aprobados
              </p>
              <p className="text-2xl font-black text-green-600">{formatCLP(totalRevenue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {orders.length === 0 ? (
        <Card className="border-dashed bg-white">
          <CardContent className="flex flex-col items-center justify-center py-14">
            <div className="flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
              <ShoppingBag className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Aún no se registran pedidos en la bóveda
            </h3>
            <p className="text-slate-600 font-medium text-center max-w-md mb-6 text-sm">
              Cuando los clientes inicien o completen compras vía Flow.cl, verás su trazabilidad,
              ítems y datos de despacho en tiempo real aquí.
            </p>
            <div className="flex gap-3">
              <Link href="/admin/productos">
                <Button className="min-h-[44px]">
                  <Package className="w-4 h-4 mr-2" />
                  Revisar Inventario
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Historial de Pedidos ({orders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Orden</TableHead>
                    <TableHead>Cliente / Despacho</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Monto & Pago</TableHead>
                    <TableHead>Estado Logístico</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const orderItems = Array.isArray(order.items) ? order.items : []
                    const itemCount = orderItems.reduce(
                      (sum, item) => sum + Number(item.quantity || 1),
                      0
                    )
                    const paymentSummary = renderPaymentDetailSummary(order.payment_detail)
                    const customerWa = buildCustomerWhatsappUrl(
                      order.customer_phone,
                      order.id,
                      order.customer_name
                    )
                    const isPaid = isOrderApproved(order)
                    const shippingMethod = (
                      order.shipping_method ||
                      order.delivery_method ||
                      ''
                    ).toLowerCase()

                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs font-semibold text-slate-800">
                          <div>{order.id}</div>
                          {typeof order.payment_detail === 'object' &&
                            order.payment_detail?.flowOrder && (
                              <span className="text-[10px] text-emerald-700 font-bold">
                                Flow #{order.payment_detail.flowOrder}
                              </span>
                            )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <p className="font-bold text-sm text-slate-900">
                              {order.customer_name}
                            </p>
                            <p className="text-xs text-slate-500 font-medium">
                              {order.customer_email}
                            </p>
                            <div className="flex items-center gap-2 pt-0.5">
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 h-4 border-slate-300 text-slate-700 uppercase"
                              >
                                {shippingMethod === 'metro'
                                  ? 'Entrega Metro'
                                  : shippingMethod === 'starken' || order.shipping_address
                                    ? 'Starken'
                                    : 'Retiro / Metro'}
                              </Badge>
                              {order.customer_phone && (
                                <span className="text-[11px] text-slate-500 font-mono">
                                  {order.customer_phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-700 whitespace-nowrap">
                          <div>{new Date(order.created_at).toLocaleDateString('es-CL')}</div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(order.created_at).toLocaleTimeString('es-CL', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-bold text-slate-900">
                              {formatCLP(order.total_amount)}
                            </p>
                            <p className="text-xs text-slate-500 font-medium mb-1">
                              {itemCount} {itemCount === 1 ? 'pieza' : 'piezas'}
                            </p>

                            <div className="flex flex-col gap-1">
                              {isPaid ? (
                                <Badge
                                  variant="outline"
                                  className="w-fit bg-green-50 text-green-700 border-green-200 text-[10px] px-2 py-0 h-5 font-semibold"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  PAGADO
                                </Badge>
                              ) : order.payment_status === 'rejected' ||
                                order.status === 'cancelled' ? (
                                <Badge
                                  variant="outline"
                                  className="w-fit bg-red-50 text-red-700 border-red-200 text-[10px] px-2 py-0 h-5 font-semibold"
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  RECHAZADO / ANULADO
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="w-fit bg-slate-100 text-slate-600 border-slate-200 text-[10px] px-2 py-0 h-5"
                                >
                                  <Clock className="w-3 h-3 mr-1" />
                                  PENDIENTE PAGO
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === 'delivered' ||
                              order.status === 'paid' ||
                              order.status === 'approved'
                                ? 'default'
                                : order.status === 'cancelled'
                                  ? 'destructive'
                                  : 'outline'
                            }
                            className={
                              order.status === 'paid' || order.status === 'approved'
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : ''
                            }
                          >
                            {order.status === 'pending' && 'Pendiente'}
                            {(order.status === 'paid' || order.status === 'approved') && 'Pagado'}
                            {order.status === 'processing' && 'Procesando'}
                            {order.status === 'shipped' && 'Enviado'}
                            {order.status === 'delivered' && 'Entregado'}
                            {order.status === 'cancelled' && 'Cancelado'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select
                              value={order.status}
                              onValueChange={(value) => updateOrderStatus(order.id, value)}
                              disabled={updatingId === order.id}
                            >
                              <SelectTrigger className="w-[138px] h-9 text-xs">
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
                                  className="h-9 w-9 p-0"
                                  title="Ver Detalles del Pedido"
                                >
                                  <Eye className="w-4 h-4 text-slate-600" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Detalles del Pedido #{order.id}</DialogTitle>
                                  <DialogDescription>
                                    Registrado el {new Date(order.created_at).toLocaleString('es-CL')}
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-4">
                                  <div className="space-y-3">
                                    <h4 className="font-semibold flex items-center gap-2">
                                      <User className="w-4 h-4" /> Datos del Cliente
                                    </h4>
                                    <div className="text-sm space-y-1.5">
                                      <p>
                                        <span className="text-muted-foreground mr-2">Nombre:</span>
                                        <span className="font-medium">{order.customer_name}</span>
                                      </p>
                                      <p>
                                        <span className="text-muted-foreground mr-2">Email:</span>
                                        {order.customer_email}
                                      </p>
                                      <p>
                                        <span className="text-muted-foreground mr-2">Teléfono:</span>
                                        {order.customer_phone || 'No registrado'}
                                      </p>
                                      {customerWa && (
                                        <a
                                          href={customerWa}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg mt-1"
                                        >
                                          <MessageCircle className="w-3.5 h-3.5" />
                                          Contactar cliente por WhatsApp
                                        </a>
                                      )}
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <h4 className="font-semibold flex items-center gap-2">
                                      <MapPin className="w-4 h-4" /> Modalidad de Entrega
                                    </h4>
                                    <div className="text-sm space-y-1">
                                      <p className="font-medium capitalize">
                                        {shippingMethod === 'metro'
                                          ? 'Entrega presencial en Metro (Santiago)'
                                          : shippingMethod === 'starken'
                                            ? 'Despacho por Starken'
                                            : 'Coordinación directa'}
                                      </p>
                                      {order.shipping_address ? (
                                        <>
                                          <p>{order.shipping_address}</p>
                                          <p className="text-muted-foreground">
                                            {[order.shipping_commune, order.shipping_city]
                                              .filter(Boolean)
                                              .join(', ')}
                                          </p>
                                        </>
                                      ) : (
                                        <p className="text-muted-foreground italic text-xs">
                                          Sin dirección postal (entrega coordinada en estación de Metro)
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-4 border-t pt-4">
                                  <h4 className="font-semibold flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4" /> Joyas Compradas ({itemCount})
                                  </h4>
                                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                    {orderItems.map((item, idx) => (
                                      <div
                                        key={`${item.id}-${idx}`}
                                        className="flex items-center gap-4 bg-muted/40 p-2.5 rounded-lg"
                                      >
                                        <div className="relative w-12 h-12 rounded overflow-hidden bg-background border shrink-0">
                                          <Image
                                            src={item.imageUrl || '/assets/logo.webp'}
                                            alt={item.name || 'Joya'}
                                            fill
                                            className="object-cover"
                                          />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium text-sm truncate">{item.name}</p>
                                          <p className="text-xs text-muted-foreground">
                                            Cantidad: {item.quantity} × {formatCLP(item.price)}
                                          </p>
                                        </div>
                                        <p className="font-semibold text-sm">
                                          {formatCLP(Number(item.price || 0) * Number(item.quantity || 1))}
                                        </p>
                                      </div>
                                    ))}
                                  </div>

                                  {order.coupon_code && (
                                    <div className="flex justify-between items-center text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded">
                                      <span>Cupón aplicado: {order.coupon_code}</span>
                                      {order.discount_amount ? (
                                        <span>-{formatCLP(order.discount_amount)}</span>
                                      ) : null}
                                    </div>
                                  )}

                                  <div className="flex justify-between items-center pt-2 border-t mt-4">
                                    <p className="font-medium text-muted-foreground">
                                      Total de la Orden
                                    </p>
                                    <p className="text-xl font-bold font-headline">
                                      {formatCLP(order.total_amount)}
                                    </p>
                                  </div>

                                  {paymentSummary && (
                                    <div className="bg-slate-100 p-2.5 rounded text-xs font-mono text-slate-700 break-words">
                                      {paymentSummary}
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
