'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Settings, Store, Mail, Globe, Shield, Save, Loader2 } from 'lucide-react'
import { adminAPI } from '@/lib/admin-api'
import { toast } from '@/hooks/use-toast'
import { Checkbox } from '@/components/ui/checkbox'
import { useSiteConfig } from '@/hooks/use-site-config'

export default function ConfiguracionPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { refreshConfig } = useSiteConfig()
  const [config, setConfig] = useState({
    store_name: '',
    store_email: '',
    store_description: '',
    store_slogan: '',
    whatsapp_number: '',
    shipping_cost: 3000,
    free_shipping_from: 50000,
    shipping_zones: '',
    admin_email: '',
    notify_new_orders: true,
    notify_low_stock: true,
    notify_new_customers: false,
    mercadopago_public_key: '',
    mercadopago_access_token: ''
  })

  useEffect(() => {
    loadConfiguration()
  }, [])

  const loadConfiguration = async () => {
    try {
      const data = await adminAPI.getConfiguration()
      setConfig(data)
    } catch (error) {
      // console.error('Error loading configuration:', error)
      toast({
        title: 'Error',
        description: 'No se pudo cargar la configuración',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (section: string) => {
    setSaving(true)
    try {
      await adminAPI.updateConfiguration(config)

      // Refrescar la configuración en toda la aplicación
      await refreshConfig()

      toast({
        title: 'Configuración guardada',
        description: `La ${section} se ha actualizado correctamente.`
      })
    } catch (error) {
      // console.error('Error saving configuration:', error)
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuración',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl -z-10" />
        <div className="p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
            Configuración
          </h1>
          <p className="mt-3 text-muted-foreground text-lg">
            Configuración general de la tienda y parámetros del sistema
          </p>
        </div>
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
                <Input
                  id="store-name"
                  value={config.store_name}
                  onChange={(e) => setConfig({ ...config, store_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="store-email">Email de Contacto</Label>
                <Input
                  id="store-email"
                  type="email"
                  value={config.store_email}
                  onChange={(e) => setConfig({ ...config, store_email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="store-slogan">Slogan de Marca</Label>
                <Input
                  id="store-slogan"
                  value={config.store_slogan || ''}
                  onChange={(e) => setConfig({ ...config, store_slogan: e.target.value })}
                  placeholder="Ej: Atrévete a jugar"
                />
              </div>
              <div>
                <Label htmlFor="whatsapp-number">WhatsApp (con prefijo, ej: +569...)</Label>
                <Input
                  id="whatsapp-number"
                  value={config.whatsapp_number || ''}
                  onChange={(e) => setConfig({ ...config, whatsapp_number: e.target.value })}
                  placeholder="+56912345678"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="store-description">Descripción del Sitio</Label>
              <Textarea
                id="store-description"
                value={config.store_description}
                onChange={(e) => setConfig({ ...config, store_description: e.target.value })}
                rows={3}
              />
            </div>
            <Button
              onClick={() => handleSave('información de la tienda')}
              disabled={saving}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Información
                </>
              )}
            </Button>
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
                value={config.mercadopago_public_key}
                onChange={(e) => setConfig({ ...config, mercadopago_public_key: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="mercadopago-secret">Access Token MercadoPago</Label>
              <Input
                id="mercadopago-secret"
                type="password"
                placeholder="TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={config.mercadopago_access_token}
                onChange={(e) => setConfig({ ...config, mercadopago_access_token: e.target.value })}
              />
            </div>
            <Button
              onClick={() => handleSave('configuración de pagos')}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Actualizar Configuración de Pagos
                </>
              )}
            </Button>
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
                <Input
                  id="shipping-cost"
                  type="number"
                  value={config.shipping_cost}
                  onChange={(e) => setConfig({ ...config, shipping_cost: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="free-shipping">Envío Gratis Desde (CLP)</Label>
                <Input
                  id="free-shipping"
                  type="number"
                  value={config.free_shipping_from}
                  onChange={(e) => setConfig({ ...config, free_shipping_from: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="shipping-zones">Zonas de Envío</Label>
              <Textarea
                id="shipping-zones"
                value={config.shipping_zones}
                onChange={(e) => setConfig({ ...config, shipping_zones: e.target.value })}
                rows={2}
              />
            </div>
            <Button
              onClick={() => handleSave('configuración de envíos')}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Configuración de Envíos
                </>
              )}
            </Button>
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
              <Input
                id="admin-email"
                type="email"
                value={config.admin_email}
                onChange={(e) => setConfig({ ...config, admin_email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Notificar por:</Label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={config.notify_new_orders}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, notify_new_orders: checked as boolean })
                    }
                  />
                  <span className="text-sm">Nuevos pedidos</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={config.notify_low_stock}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, notify_low_stock: checked as boolean })
                    }
                  />
                  <span className="text-sm">Stock bajo</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={config.notify_new_customers}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, notify_new_customers: checked as boolean })
                    }
                  />
                  <span className="text-sm">Nuevos clientes</span>
                </label>
              </div>
            </div>
            <Button
              onClick={() => handleSave('configuración de notificaciones')}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Configuración
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}