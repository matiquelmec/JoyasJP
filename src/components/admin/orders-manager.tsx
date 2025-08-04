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
  customerName: string
  customerEmail: string
  date: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  shippingAddress: string
}

export function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carga de pedidos - en realidad vendrían de una API
    // Por ahora mostramos que no hay pedidos
    setTimeout(() => {
      setOrders([]) // Array vacío = no hay pedidos
      setLoading(false)
    }, 1000)
  }, [])

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
    .reduce((sum, order) => sum + order.total, 0)

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
            <h3 className="text-lg font-semibold mb-2">No hay pedidos aún</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
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
              <strong>Estado actual:</strong> Los pedidos se procesan actualmente de forma manual a través de:
            </p>
            <ul className="text-sm list-disc list-inside space-y-1 ml-4">
              <li>Formulario de checkout que envía emails con los datos del pedido</li>
              <li>La información de compra se guarda temporalmente en el navegador</li>
              <li>Los pagos se procesan mediante MercadoPago</li>
            </ul>
            <div className="mt-4 p-3 bg-white dark:bg-gray-900 rounded-lg border">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Para automatizar completamente el sistema:
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Se puede implementar una tabla 'orders' en Supabase para almacenar todos los pedidos 
                y mostrar estadísticas detalladas aquí.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}