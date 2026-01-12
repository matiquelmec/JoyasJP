import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, Users, ShoppingCart, AlertCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl -z-10" />
        <div className="p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
            Analytics
          </h1>
          <p className="mt-3 text-muted-foreground text-lg">
            Métricas detalladas y análisis de rendimiento
          </p>
        </div>
      </div>

      {/* Estado actual - sin datos */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
            <BarChart3 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Analytics en Desarrollo</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Los datos de analytics aparecerán aquí cuando se implemente la integración 
            con herramientas de análisis web como Google Analytics.
          </p>
        </CardContent>
      </Card>

      {/* Información sobre integración de analytics */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <AlertCircle className="h-5 w-5" />
            Integración de Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-blue-700 dark:text-blue-300 space-y-4">
            <p className="text-sm">
              <strong>Para obtener métricas detalladas, se recomienda integrar:</strong>
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Google Analytics 4</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Tráfico web en tiempo real</li>
                  <li>• Conversiones de ecommerce</li>
                  <li>• Comportamiento de usuarios</li>
                  <li>• Fuentes de tráfico</li>
                </ul>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link href="https://analytics.google.com" target="_blank">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Configurar GA4
                  </Link>
                </Button>
              </div>

              <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">MercadoPago Analytics</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Ventas y transacciones</li>
                  <li>• Métodos de pago preferidos</li>
                  <li>• Tasas de conversión</li>
                  <li>• Reportes financieros</li>
                </ul>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link href="https://www.mercadopago.cl/developers" target="_blank">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver Reportes MP
                  </Link>
                </Button>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Métricas disponibles actualmente:
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">0</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pedidos completados</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">$0</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ingresos totales</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">0</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Clientes registrados</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">-</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tasa de conversión</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas del inventario (disponibles) */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas del Inventario</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Datos disponibles basados en tu inventario actual:
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Productos</p>
                  <p className="text-2xl font-bold">Ver Dashboard</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Valor Inventario</p>
                  <p className="text-2xl font-bold">Ver Dashboard</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Stock Bajo</p>
                  <p className="text-2xl font-bold">Ver Dashboard</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Categorías</p>
                  <p className="text-2xl font-bold">4</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="mt-4">
            <Link href="/admin">
              <Button variant="outline">
                Ver Dashboard Completo
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}