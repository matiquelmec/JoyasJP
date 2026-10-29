'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  TrendingUp,
  Package,
  DollarSign,
  AlertTriangle,
  BarChart3,
  ShoppingCart,
  Clock,
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
  paidOrders: number
  totalRevenue: number
  inventoryValue: number
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
      const [allProducts, allOrders] = await Promise.all([
        adminAPI.getProducts().catch(() => []),
        adminAPI.getOrders().catch(() => []),
      ])

      const products = (allProducts || []).filter((p: any) => !p.deleted_at)
      const orders = allOrders || []

      const physicalProducts = products.filter((p: any) => !p.is_bundle)
      const activeProducts = products.filter((p: any) => Number(p.stock || 0) > 0)
      const lowStockProducts = physicalProducts.filter((p: any) => Number(p.stock || 0) === 1)
      const outOfStockProducts = physicalProducts.filter((p: any) => Number(p.stock || 0) === 0)

      const topProducts = [...activeProducts]
        .sort((a: any, b: any) => b.price - a.price)
        .slice(0, 5)

      const lowStockItems = lowStockProducts
        .sort((a: any, b: any) => a.stock - b.stock)
        .slice(0, 5)

      const totalInventoryValue = physicalProducts.reduce(
        (sum: number, p: any) => sum + Number(p.price) * Number(p.stock || 0),
        0
      )

      const paidOrdersList = orders.filter(
        (o: any) =>
          o.payment_status === 'paid' ||
          o.payment_status === 'approved' ||
          o.status === 'delivered' ||
          o.status === 'paid'
      )
      const pendingOrdersList = orders.filter((o: any) => o.status === 'pending')

      const totalRevenue = paidOrdersList.reduce(
        (sum: number, o: any) => sum + Number(o.total_amount || 0),
        0
      )

      setStats({
        totalProducts: products.length,
        activeProducts: activeProducts.length,
        lowStockProducts: lowStockProducts.length,
        outOfStockProducts: outOfStockProducts.length,
        totalOrders: orders.length,
        pendingOrders: pendingOrdersList.length,
        paidOrders: paidOrdersList.length,
        totalRevenue,
        inventoryValue: totalInventoryValue,
        topProducts,
        lowStockItems,
      })
    } catch (error) {
      // Ignorar
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground uppercase font-black tracking-widest text-xs animate-pulse">
          Cargando métricas...
        </div>
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-border/10 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-bold text-slate-600 uppercase tracking-wider">
              Ventas Aprobadas
            </CardTitle>
            <div className="p-2 rounded-xl bg-green-500/10">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black text-slate-950 mb-1">
              {formatCLP(stats.totalRevenue)}
            </div>
            <p className="text-xs text-slate-500 font-bold">
              {stats.paidOrders} pedidos pagados
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/10 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/5" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-bold text-slate-600 uppercase tracking-wider">
              Valor del Inventario
            </CardTitle>
            <div className="p-2 rounded-xl bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black text-slate-950 mb-1">
              {formatCLP(stats.inventoryValue)}
            </div>
            <p className="text-xs text-slate-500 font-bold">
              {stats.activeProducts} de {stats.totalProducts} joyas con stock
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/10 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-yellow-500/5" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-bold text-slate-600 uppercase tracking-wider">
              Pedidos Pendientes
            </CardTitle>
            <div className="p-2 rounded-xl bg-orange-500/10">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black text-slate-950 mb-1">
              {stats.pendingOrders}
            </div>
            <p className="text-xs text-slate-500 font-bold">
              De {stats.totalOrders} pedidos totales registrados
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/10 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-rose-500/5" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-bold text-slate-600 uppercase tracking-wider">
              Sin Stock / Agotados
            </CardTitle>
            <div className="p-2 rounded-xl bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black text-slate-950 mb-1">
              {stats.outOfStockProducts}
            </div>
            <p className="text-xs text-slate-500 font-bold">
              {stats.lowStockProducts} con 1 unidad restante
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Stock Bajo */}
      {stats.lowStockProducts > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Inventario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-4 text-sm">
              {stats.lowStockProducts} productos tienen solo 1 unidad restante en catálogo
            </p>
            <div className="space-y-2">
              {stats.lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-white rounded-lg border border-orange-100"
                >
                  <div>
                    <span className="font-bold text-sm text-slate-900">{item.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">({item.category})</span>
                  </div>
                  <Badge variant={'destructive' as any}>
                    {item.stock} unidad
                  </Badge>
                </div>
              ))}
            </div>
            <Link href="/admin/productos">
              <Button variant={'outline' as any} className="mt-4 bg-white" size={'sm' as any}>
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
              Piezas Exclusivas de Mayor Valor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topProducts.map((product) => (
                <div key={product.id} className="flex items-center space-x-4">
                  <div className="relative h-10 w-10 rounded-lg overflow-hidden border bg-zinc-100 shrink-0">
                    <Image
                      src={product.imageUrl || '/assets/logo.webp'}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      Stock: {product.stock} | {product.category}
                    </p>
                  </div>
                  <div className="text-sm font-black text-slate-900">
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
              Estado del Catálogo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span>Disponibilidad en Vitrina</span>
                <span className="font-bold">
                  {stats.activeProducts}/{stats.totalProducts}
                </span>
              </div>
              <Progress
                value={
                  stats.totalProducts > 0
                    ? (stats.activeProducts / stats.totalProducts) * 100
                    : 0
                }
                className="mt-2"
              />
            </div>
            <div className="pt-4 border-t flex justify-between items-center">
              <Link href="/admin/pedidos">
                <Button variant="outline" size="sm" className="gap-2">
                  <ShoppingCart className="w-4 h-4" /> Ver Pedidos
                </Button>
              </Link>
              <Link href="/admin/cupones">
                <Button variant="outline" size="sm" className="gap-2">
                  Gestión de Cupones
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
