'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Download,
  Eye,
  BarChart3,
  PieChart,
} from 'lucide-react'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { DateRange } from 'react-day-picker'
import { addDays, subDays, startOfMonth, endOfMonth, format } from 'date-fns'

interface SalesData {
  period: string
  total_sales: number
  total_orders: number
  average_order_value: number
  unique_customers: number
}

interface ProductSales {
  product_id: string
  product_name: string
  category: string
  units_sold: number
  revenue: number
  stock_remaining: number
}

interface RegionSales {
  region: string
  orders: number
  revenue: number
  customers: number
}

interface PaymentMethodStats {
  payment_method: string
  orders: number
  revenue: number
  percentage: number
}

export default function ReportsPage() {
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [productSales, setProductSales] = useState<ProductSales[]>([])
  const [regionSales, setRegionSales] = useState<RegionSales[]>([])
  const [paymentStats, setPaymentStats] = useState<PaymentMethodStats[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<
    '7d' | '30d' | '90d' | 'custom'
  >('30d')
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  useEffect(() => {
    updateDateRange()
  }, [selectedPeriod])

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      fetchReportsData()
    }
  }, [dateRange])

  const updateDateRange = () => {
    const now = new Date()
    switch (selectedPeriod) {
      case '7d':
        setDateRange({ from: subDays(now, 7), to: now })
        break
      case '30d':
        setDateRange({ from: subDays(now, 30), to: now })
        break
      case '90d':
        setDateRange({ from: subDays(now, 90), to: now })
        break
      case 'custom':
        // No cambiar el rango si es custom
        break
    }
  }

  const fetchReportsData = async () => {
    if (!dateRange?.from || !dateRange?.to) return

    if (!supabase) {
      console.error('Supabase not initialized')
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      const fromDate = format(dateRange.from, 'yyyy-MM-dd')
      const toDate = format(dateRange.to, 'yyyy-MM-dd')

      // Datos simulados para demo (después se conectará con datos reales)
      const demoSalesData = [
        {
          period: fromDate,
          total_sales: 450000,
          total_orders: 3,
          average_order_value: 150000,
          unique_customers: 3,
        },
        {
          period: toDate,
          total_sales: 320000,
          total_orders: 2,
          average_order_value: 160000,
          unique_customers: 2,
        },
      ]

      const demoProductSales = [
        {
          product_id: '1',
          product_name: 'Anillo Vintage',
          category: 'anillos',
          units_sold: 2,
          revenue: 180000,
          stock_remaining: 8,
        },
        {
          product_id: '2',
          product_name: 'Collar Minimalista',
          category: 'collares',
          units_sold: 1,
          revenue: 95000,
          stock_remaining: 5,
        },
      ]

      const demoRegionSales = [
        { region: 'Santiago', orders: 3, revenue: 320000, customers: 2 },
        { region: 'Valparaíso', orders: 2, revenue: 450000, customers: 3 },
      ]

      const demoPaymentStats = [
        {
          payment_method: 'mercadopago',
          orders: 4,
          revenue: 640000,
          percentage: 80,
        },
        {
          payment_method: 'transferencia',
          orders: 1,
          revenue: 130000,
          percentage: 20,
        },
      ]

      setSalesData(demoSalesData)
      setProductSales(demoProductSales)
      setRegionSales(demoRegionSales)
      setPaymentStats(demoPaymentStats)
    } catch (error) {
      console.error('Error fetching reports data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calcular totales del período
  const periodTotals = useMemo(() => {
    if (salesData.length === 0) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        uniqueCustomers: 0,
      }
    }

    const totalRevenue = salesData.reduce(
      (sum, day) => sum + day.total_sales,
      0
    )
    const totalOrders = salesData.reduce(
      (sum, day) => sum + day.total_orders,
      0
    )
    const uniqueCustomers = Math.max(
      ...salesData.map((day) => day.unique_customers)
    )

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      uniqueCustomers,
    }
  }, [salesData])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-CL', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString))
  }

  const exportData = async (type: 'sales' | 'products' | 'regions') => {
    let data: any[] = []
    let filename = ''

    switch (type) {
      case 'sales':
        data = salesData
        filename = 'ventas_por_dia.csv'
        break
      case 'products':
        data = productSales
        filename = 'ventas_por_producto.csv'
        break
      case 'regions':
        data = regionSales
        filename = 'ventas_por_region.csv'
        break
    }

    if (data.length === 0) return

    // Convertir a CSV
    const headers = Object.keys(data[0]).join(',')
    const rows = data.map((row) => Object.values(row).join(',')).join('\n')
    const csv = `${headers}\n${rows}`

    // Descargar archivo
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Reportes de Ventas
          </h1>
          <p className="text-muted-foreground">
            Analiza el rendimiento de tu tienda y toma decisiones informadas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={selectedPeriod}
            onValueChange={(value: any) => setSelectedPeriod(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
          {selectedPeriod === 'custom' && (
            <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
          )}
        </div>
      </div>

      {/* Resumen del período */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos Totales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(periodTotals.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              En {salesData.length} días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{periodTotals.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Promedio:{' '}
              {(
                periodTotals.totalOrders / Math.max(salesData.length, 1)
              ).toFixed(1)}
              /día
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Promedio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(periodTotals.averageOrderValue)}
            </div>
            <p className="text-xs text-muted-foreground">Por pedido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes Únicos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {periodTotals.uniqueCustomers}
            </div>
            <p className="text-xs text-muted-foreground">En el período</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sales">Ventas por Día</TabsTrigger>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="regions">Regiones</TabsTrigger>
          <TabsTrigger value="payments">Métodos de Pago</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Ventas Diarias</CardTitle>
                <CardDescription>
                  Evolución de las ventas en el período seleccionado
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportData('sales')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent>
              {salesData.length > 0 ? (
                <div className="space-y-4">
                  {salesData.map((day, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">
                          {formatDate(day.period)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {day.total_orders} pedidos • {day.unique_customers}{' '}
                          clientes
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">
                          {formatCurrency(day.total_sales)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Promedio: {formatCurrency(day.average_order_value)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No hay datos de ventas para el período seleccionado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Ventas por Producto</CardTitle>
                <CardDescription>
                  Rendimiento individual de cada producto
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportData('products')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent>
              {productSales.length > 0 ? (
                <div className="space-y-4">
                  {productSales.map((product) => (
                    <div
                      key={product.product_id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium">{product.product_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{product.category}</Badge>
                          <span className="text-sm text-muted-foreground">
                            Stock: {product.stock_remaining}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">
                          {formatCurrency(product.revenue)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {product.units_sold} unidades vendidas
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No hay datos de productos para el período seleccionado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regions" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Ventas por Región</CardTitle>
                <CardDescription>
                  Distribución geográfica de las ventas
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportData('regions')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent>
              {regionSales.length > 0 ? (
                <div className="space-y-4">
                  {regionSales.map((region) => (
                    <div
                      key={region.region}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{region.region}</h3>
                        <p className="text-sm text-muted-foreground">
                          {region.customers} clientes únicos
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">
                          {formatCurrency(region.revenue)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {region.orders} pedidos
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No hay datos de regiones para el período seleccionado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pago</CardTitle>
              <CardDescription>
                Preferencias de pago de los clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentStats.length > 0 ? (
                <div className="space-y-4">
                  {paymentStats.map((method) => (
                    <div
                      key={method.payment_method}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium capitalize">
                          {method.payment_method}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {method.percentage.toFixed(1)}% del total
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">
                          {formatCurrency(method.revenue)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {method.orders} transacciones
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No hay datos de métodos de pago para el período seleccionado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
