import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Mail, Phone, MapPin, AlertCircle, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ClientesPage() {
  return (
    <div className="space-y-8">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl -z-10" />
        <div className="p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
            Clientes
          </h1>
          <p className="mt-3 text-muted-foreground text-lg">
            Gestión de clientes y datos de contacto
          </p>
        </div>
      </div>

      {/* Estadísticas actuales */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Sin registros aún
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Realizados</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Vía checkout form
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas de Contacto</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Formulario de contacto
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estado sin clientes */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No hay clientes registrados</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Los datos de clientes aparecerán aquí cuando implementes un sistema de 
            registro de usuarios o cuando los clientes realicen compras.
          </p>
          <div className="flex gap-3">
            <Link href="/admin/pedidos">
              <Button>
                <Mail className="w-4 h-4 mr-2" />
                Ver Pedidos
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline">
                <Phone className="w-4 h-4 mr-2" />
                Página de Contacto
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Información sobre gestión de clientes */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <AlertCircle className="h-5 w-5" />
            Sistema de Gestión de Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-blue-700 dark:text-blue-300 space-y-4">
            <p className="text-sm">
              <strong>Estado actual:</strong> Los datos de clientes se recopilan a través de:
            </p>
            
            <ul className="text-sm list-disc list-inside space-y-1 ml-4">
              <li>Formulario de checkout (información de envío y contacto)</li>
              <li>Formulario de contacto en la página web</li>
              <li>Interacciones por WhatsApp y redes sociales</li>
            </ul>

            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Para implementar gestión completa de clientes:
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Crear tabla 'customers' en Supabase</li>
                <li>• Sistema de registro/login opcional</li>
                <li>• Historial de compras por cliente</li>
                <li>• Newsletter y marketing por email</li>
                <li>• Segmentación y análisis de comportamiento</li>
              </ul>
            </div>

            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Datos disponibles actualmente:
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Los datos de contacto y envío se reciben por email cuando los clientes 
                completan el proceso de checkout. Esta información se puede usar para 
                seguimiento manual de pedidos y comunicación directa.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas de interacción */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Puntos de Contacto con Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Checkout Process</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Los clientes proporcionan datos de contacto y envío al realizar compras
              </p>
              <ul className="text-sm space-y-1">
                <li>• Nombre completo</li>
                <li>• Email de contacto</li>
                <li>• Teléfono</li>
                <li>• Dirección de envío completa</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Página de Contacto</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Consultas y comunicación directa a través del formulario web
              </p>
              <ul className="text-sm space-y-1">
                <li>• Nombre y email</li>
                <li>• Mensaje/consulta</li>
                <li>• Interés específico</li>
                <li>• Teléfono opcional</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}