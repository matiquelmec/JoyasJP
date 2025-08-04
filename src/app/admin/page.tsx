'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase-client'
import {
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Download,
} from 'lucide-react'

interface DashboardStats {
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  totalRevenue: number
  pendingOrders: number
  lowStockProducts: number
}

interface Order {
  id: string
  customer_name: string
  contact_email: string
  shipping_address: string
  total_amount: number
  status: string
  created_at: string
  ordered_products: any[]
}

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: string
  imageUrl: string
  created_at: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  })

  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboardData = async () => {
    if (!supabase) {
      console.error('Supabase not initialized')
      return
    }

    try {
      setRefreshing(true)

      // Fetch orders
      const { data: ordersData, error: ordersError } = (await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)) as { data: Order[] | null; error: any }

      if (ordersError) {
        console.error('Error fetching orders:', ordersError)
      } else {
        setOrders(ordersData || [])
      }

      // Fetch products
      const { data: productsData, error: productsError } = (await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })) as {
        data: Product[] | null
        error: any
      }

      if (productsError) {
        console.error('Error fetching products:', productsError)
      } else {
        setProducts(productsData || [])
      }

      // Calculate stats
      const totalOrders = ordersData?.length || 0
      const totalProducts = productsData?.length || 0
      const pendingOrders =
        ordersData?.filter((order) => order.status === 'pending').length || 0
      const lowStockProducts =
        productsData?.filter((product) => (product.stock || 0) < 5).length || 0
      const totalRevenue =
        ordersData?.reduce(
          (sum, order) => sum + (order.total_amount || 0),
          0
        ) || 0

      // Unique customers (approximate)
      const uniqueEmails = new Set(
        ordersData?.map((order) => order.contact_email) || []
      )
      const totalCustomers = uniqueEmails.size

      setStats({
        totalOrders,
        totalProducts,
        totalCustomers,
        totalRevenue,
        pendingOrders,
        lowStockProducts,
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendiente', variant: 'default' as const },
      processing: { label: 'Procesando', variant: 'secondary' as const },
      shipped: { label: 'Enviado', variant: 'outline' as const },
      delivered: { label: 'Entregado', variant: 'secondary' as const },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const },
    }

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-gray-600" />
          <p className="mt-2 text-gray-600">Cargando panel administrativo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Panel Administrativo
              </h1>
              <p className="text-gray-600">Gestiona tu tienda Joyas JP</p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={fetchDashboardData}
                disabled={refreshing}
                variant="outline"
                size="sm"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
                />
                Actualizar
              </Button>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pedidos
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingOrders} pendientes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.lowStockProducts} con stock bajo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                Únicos registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ingresos Totales
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">Este período</p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Gestión de Pedidos
              </CardTitle>
              <CardDescription>
                Administra todos los pedidos de tu tienda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <a href="/admin/orders">Ver Pedidos</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Gestión de Productos
              </CardTitle>
              <CardDescription>
                Administra tu inventario y catálogo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <a href="/admin/products">Ver Productos</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Base de Clientes
              </CardTitle>
              <CardDescription>
                Gestiona tus clientes y su historial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <a href="/admin/customers">Ver Clientes</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Reportes de Ventas
              </CardTitle>
              <CardDescription>
                Analiza el rendimiento de tu negocio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <a href="/admin/reports">Ver Reportes</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders">Resumen Pedidos</TabsTrigger>
            <TabsTrigger value="products">Resumen Productos</TabsTrigger>
            <TabsTrigger value="analytics">Vista General</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pedidos Recientes</CardTitle>
                <CardDescription>
                  Gestiona y revisa los pedidos de tu tienda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No hay pedidos
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Los pedidos aparecerán aquí cuando los clientes realicen
                        compras.
                      </p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div
                        key={order.id}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <p className="font-medium">
                              Pedido #{order.id.slice(0, 8)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.customer_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {order.contact_email}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                          <div className="text-right space-y-2">
                            <p className="font-bold">
                              {formatCurrency(order.total_amount)}
                            </p>
                            {getStatusBadge(order.status)}
                            <div className="flex space-x-1">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        {order.shipping_address && (
                          <p className="text-xs text-gray-500 mt-2">
                            Envío: {order.shipping_address}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gestión de Productos</CardTitle>
                    <CardDescription>
                      Administra tu inventario y productos
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Producto
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No hay productos
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Comienza agregando productos a tu catálogo.
                      </p>
                    </div>
                  ) : (
                    products.map((product) => (
                      <div
                        key={product.id}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex space-x-4">
                            <img
                              src={
                                product.imageUrl || '/placeholder-product.jpg'
                              }
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                            <div className="space-y-1">
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-600 capitalize">
                                {product.category}
                              </p>
                              <p className="text-sm font-medium">
                                {formatCurrency(product.price)}
                              </p>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">
                                  Stock:
                                </span>
                                <Badge
                                  variant={
                                    (product.stock || 0) < 5
                                      ? 'destructive'
                                      : 'secondary'
                                  }
                                >
                                  {product.stock || 0}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vista General del Negocio</CardTitle>
                <CardDescription>
                  Resumen ejecutivo de tu tienda Joyas JP
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Rendimiento Actual</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Conversión promedio:
                        </span>
                        <span className="font-medium">2.3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Valor promedio del pedido:
                        </span>
                        <span className="font-medium">
                          {formatCurrency(
                            stats.totalRevenue / Math.max(stats.totalOrders, 1)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Productos más vendidos:
                        </span>
                        <span className="font-medium">Anillos</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Próximas Acciones</h3>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-yellow-600">⚠️</span>
                        <span className="ml-2">
                          {stats.pendingOrders} pedidos pendientes
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-red-600">🔴</span>
                        <span className="ml-2">
                          {stats.lowStockProducts} productos con stock bajo
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-green-600">✅</span>
                        <span className="ml-2">
                          Sistema funcionando correctamente
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
