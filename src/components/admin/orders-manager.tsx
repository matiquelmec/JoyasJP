'use client'

import { useState } from 'react'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Eye,
  MessageSquare,
} from 'lucide-react'

// Datos de ejemplo para pedidos (en producción vendrían de Supabase)
const mockOrders = [
  {
    id: 'ORD-001',
    customerName: 'María González',
    customerEmail: 'maria@example.com',
    date: '2024-08-04',
    status: 'pending',
    total: 85000,
    items: [
      { name: 'Collar Oro Rosa', quantity: 1, price: 85000 }
    ],
    shippingAddress: 'Av. Providencia 1234, Santiago'
  },
  {
    id: 'ORD-002',
    customerName: 'Carlos Martínez',
    customerEmail: 'carlos@example.com',
    date: '2024-08-03',
    status: 'processing',
    total: 120000,
    items: [
      { name: 'Anillo Plata 925', quantity: 2, price: 60000 }
    ],
    shippingAddress: 'Las Condes 567, Santiago'
  },
  {
    id: 'ORD-003',
    customerName: 'Ana Rodríguez',
    customerEmail: 'ana@example.com',
    date: '2024-08-02',
    status: 'shipped',
    total: 95000,
    items: [
      { name: 'Pulsera Cuero', quantity: 1, price: 45000 },
      { name: 'Aros Plata', quantity: 1, price: 50000 }
    ],
    shippingAddress: 'Ñuñoa 890, Santiago'
  },
  {
    id: 'ORD-004',
    customerName: 'Luis Herrera',
    customerEmail: 'luis@example.com',
    date: '2024-08-01',
    status: 'delivered',
    total: 150000,
    items: [
      { name: 'Collar Premium', quantity: 1, price: 150000 }
    ],
    shippingAddress: 'Vitacura 123, Santiago'
  },
  {
    id: 'ORD-005',
    customerName: 'Carmen Silva',
    customerEmail: 'carmen@example.com',
    date: '2024-07-31',
    status: 'cancelled',
    total: 75000,
    items: [
      { name: 'Anillo Básico', quantity: 1, price: 75000 }
    ],
    shippingAddress: 'Maipú 456, Santiago'
  }
]

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export function OrdersManager() {
  const [orders] = useState(mockOrders)
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all')

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig = {
      pending: { label: 'Pendiente', variant: 'secondary' as const, icon: Clock },
      processing: { label: 'Procesando', variant: 'default' as const, icon: Package },
      shipped: { label: 'Enviado', variant: 'outline' as const, icon: Truck },
      delivered: { label: 'Entregado', variant: 'default' as const, icon: CheckCircle, className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const, icon: XCircle }
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    )
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

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus)

  const stats = getStatusStats()
  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, order) => sum + order.total, 0)

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

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrar por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
              size="sm"
            >
              Todos ({orders.length})
            </Button>
            <Button
              variant={filterStatus === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('pending')}
              size="sm"
            >
              <Clock className="mr-1 h-3 w-3" />
              Pendientes ({stats.pending})
            </Button>
            <Button
              variant={filterStatus === 'processing' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('processing')}
              size="sm"
            >
              <Package className="mr-1 h-3 w-3" />
              Procesando ({stats.processing})
            </Button>
            <Button
              variant={filterStatus === 'shipped' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('shipped')}
              size="sm"
            >
              <Truck className="mr-1 h-3 w-3" />
              Enviados ({stats.shipped})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de pedidos */}
      <Card>
        <CardHeader>
          <CardTitle>
            Pedidos ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.id}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.customerEmail}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(order.date).toLocaleDateString('es-CL')}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium">{item.quantity}x</span> {item.name}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">
                      {formatCLP(order.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Contactar cliente
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Package className="mr-2 h-4 w-4" />
                            Marcar como procesado
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Truck className="mr-2 h-4 w-4" />
                            Marcar como enviado
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}