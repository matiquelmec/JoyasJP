'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  TrendingUp,
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react'
import { supabase } from '@/lib/supabase-client'

interface DashboardStats {
  totalProducts: number
  lowStockProducts: number
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  monthlyRevenue: number
  totalCustomers: number
  topSellingProducts: Array<{
    id: string
    name: string
    sold: number
    revenue: number
    image_url: string
  }>
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      if (!supabase) return

      // Obtener estadísticas de productos
      const { data: products } = await supabase
        .from('products')
        .select('*')

      const totalProducts = products?.length || 0
      const lowStockProducts = products?.filter(p => p.stock <= 5).length || 0

      // Para demo, usar datos simulados para órdenes y ventas
      // En producción conectarías con tu tabla de órdenes real
      const mockStats: DashboardStats = {
        totalProducts,
        lowStockProducts,
        totalOrders: 156,
        pendingOrders: 8,
        totalRevenue: 2340000, // CLP
        monthlyRevenue: 480000, // CLP
        totalCustomers: 89,
        topSellingProducts: products?.slice(0, 5).map((p, i) => ({
          id: p.id,
          name: p.name,
          sold: Math.floor(Math.random() * 20) + 5,
          revenue: Math.floor(Math.random() * 100000) + 50000,
          image_url: p.image_url || '/assets/logo.png'
        })) || []
      }

      setStats(mockStats)
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading dashboard...</div>
  }

  if (!stats) {
    return <div>Error loading dashboard data</div>
  }

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-8">
      {/* KPIs principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCLP(stats.monthlyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              +12.5% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Totales</CardTitle>
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
            <div className="flex items-center text-xs">
              {stats.lowStockProducts > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {stats.lowStockProducts} stock bajo
                </Badge>
              )}
            </div>
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
              +8 este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Stock Bajo */}
      {stats.lowStockProducts > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Inventario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 dark:text-orange-300">
              {stats.lowStockProducts} productos con stock bajo (≤5 unidades)
            </p>
            <div className="mt-2">
              <Badge variant="outline" className="text-orange-800 border-orange-300">
                Revisar inventario
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Productos Más Vendidos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Productos Más Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topSellingProducts.map((product) => (
                <div key={product.id} className="flex items-center space-x-4">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.sold} vendidos
                    </p>
                  </div>
                  <div className="text-sm font-bold text-green-600">
                    {formatCLP(product.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Resumen Financiero
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span>Ingresos Totales</span>
                <span className="font-bold">{formatCLP(stats.totalRevenue)}</span>
              </div>
              <Progress value={75} className="mt-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Meta Mensual</span>
                <span>80%</span>
              </div>
              <Progress value={80} className="mt-2" />
            </div>
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Proyección: {formatCLP(stats.monthlyRevenue * 1.2)} este mes
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}