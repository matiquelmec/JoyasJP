'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { adminAPI } from '@/lib/admin-api'
import Link from 'next/link'

interface DashboardStats {
  totalProducts: number
  activeProducts: number
  lowStockProducts: number
  outOfStockProducts: number
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  totalCustomers: number
  topProducts: Array<{
    id: string
    name: string
    stock: number
    price: number
    imageUrl: string
    category: string
  }>
  lowStockItems: Array<{
    id: string
    name: string
    stock: number
    category: string
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
      // Obtener productos reales
      const products = await adminAPI.getProducts()
      
      // Calcular estadísticas de productos
      const activeProducts = products.filter(p => p.stock > 0)
      const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5)
      const outOfStockProducts = products.filter(p => p.stock === 0)
      
      // Top 5 productos por precio (como ejemplo de "más valiosos")
      const topProducts = [...activeProducts]
        .sort((a, b) => b.price - a.price)
        .slice(0, 5)
      
      // Productos con stock bajo
      const lowStockItems = lowStockProducts
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 5)

      // Calcular valor total del inventario
      const totalInventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0)

      const dashboardStats: DashboardStats = {
        totalProducts: products.length,
        activeProducts: activeProducts.length,
        lowStockProducts: lowStockProducts.length,
        outOfStockProducts: outOfStockProducts.length,
        totalOrders: 0, // Por ahora 0, cuando tengamos tabla de orders se actualiza
        pendingOrders: 0,
        totalRevenue: totalInventoryValue, // Valor del inventario como referencia
        totalCustomers: 0, // Por ahora 0
        topProducts,
        lowStockItems
      }

      setStats(dashboardStats)
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Cargando estadísticas...</div>
      </div>
    )
  }

  if (!stats) {
    return <div>Error al cargar los datos del dashboard</div>
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
            <CardTitle className="text-sm font-medium">Valor del Inventario</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCLP(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor total de productos en stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Totales</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeProducts} con stock disponible
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              Productos con ≤5 unidades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.outOfStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              Productos agotados
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
            <p className="text-orange-700 dark:text-orange-300 mb-4">
              {stats.lowStockProducts} productos requieren reposición inmediata
            </p>
            <div className="space-y-2">
              {stats.lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded-lg">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">({item.category})</span>
                  </div>
                  <Badge variant="destructive">
                    {item.stock} unidades
                  </Badge>
                </div>
              ))}
            </div>
            <Link href="/admin/productos">
              <Button variant="outline" className="mt-4" size="sm">
                Ver todos los productos
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Productos destacados y resumen */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Productos de Mayor Valor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topProducts.map((product) => (
                <div key={product.id} className="flex items-center space-x-4">
                  <img
                    src={product.imageUrl || '/assets/logo.png'}
                    alt={product.name}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Stock: {product.stock} | {product.category}
                    </p>
                  </div>
                  <div className="text-sm font-bold">
                    {formatCLP(product.price)}
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
              Resumen de Inventario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span>Productos Activos</span>
                <span className="font-bold">{stats.activeProducts}/{stats.totalProducts}</span>
              </div>
              <Progress 
                value={(stats.activeProducts / stats.totalProducts) * 100} 
                className="mt-2" 
              />
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Estado del Stock</span>
                <span>{Math.round(((stats.totalProducts - stats.lowStockProducts - stats.outOfStockProducts) / stats.totalProducts) * 100)}% Óptimo</span>
              </div>
              <Progress 
                value={((stats.totalProducts - stats.lowStockProducts - stats.outOfStockProducts) / stats.totalProducts) * 100} 
                className="mt-2" 
              />
            </div>
            <div className="pt-2 border-t">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.activeProducts - stats.lowStockProducts}</p>
                  <p className="text-xs text-muted-foreground">Stock OK</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">{stats.lowStockProducts}</p>
                  <p className="text-xs text-muted-foreground">Stock Bajo</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{stats.outOfStockProducts}</p>
                  <p className="text-xs text-muted-foreground">Sin Stock</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}