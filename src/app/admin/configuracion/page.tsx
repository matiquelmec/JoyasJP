import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Settings, Store, Mail, Globe, Shield } from 'lucide-react'

export default function ConfiguracionPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Configuración
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Configuración general de la tienda y parámetros del sistema
        </p>
      </div>

      <div className="grid gap-6">
        {/* Información de la Tienda */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Información de la Tienda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="store-name">Nombre de la Tienda</Label>
                <Input id="store-name" defaultValue="Joyas JP" />
              </div>
              <div>
                <Label htmlFor="store-email">Email de Contacto</Label>
                <Input id="store-email" type="email" defaultValue="contacto@joyasjp.com" />
              </div>
            </div>
            <div>
              <Label htmlFor="store-description">Descripción</Label>
              <Textarea 
                id="store-description" 
                defaultValue="Alta joyería para la escena urbana con diseños únicos y calidad premium."
                rows={3}
              />
            </div>
            <Button>Guardar Información</Button>
          </CardContent>
        </Card>

        {/* Configuración de Pagos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Métodos de Pago
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mercadopago-key">Clave Pública MercadoPago</Label>
              <Input 
                id="mercadopago-key" 
                type="password" 
                placeholder="TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
            </div>
            <div>
              <Label htmlFor="mercadopago-secret">Clave Privada MercadoPago</Label>
              <Input 
                id="mercadopago-secret" 
                type="password" 
                placeholder="TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
            </div>
            <Button>Actualizar Configuración de Pagos</Button>
          </CardContent>
        </Card>

        {/* Configuración de Envíos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Configuración de Envíos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shipping-cost">Costo de Envío (CLP)</Label>
                <Input id="shipping-cost" type="number" defaultValue="3000" />
              </div>
              <div>
                <Label htmlFor="free-shipping">Envío Gratis Desde (CLP)</Label>
                <Input id="free-shipping" type="number" defaultValue="50000" />
              </div>
            </div>
            <div>
              <Label htmlFor="shipping-zones">Zonas de Envío</Label>
              <Textarea 
                id="shipping-zones" 
                defaultValue="Santiago, Valparaíso, Concepción, La Serena"
                rows={2}
              />
            </div>
            <Button>Guardar Configuración de Envíos</Button>
          </CardContent>
        </Card>

        {/* Configuración de Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="admin-email">Email del Administrador</Label>
              <Input id="admin-email" type="email" defaultValue="admin@joyasjp.com" />
            </div>
            <div className="space-y-2">
              <Label>Notificar por:</Label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Nuevos pedidos</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Stock bajo</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span className="text-sm">Nuevos clientes</span>
                </label>
              </div>
            </div>
            <Button>Guardar Configuración</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}