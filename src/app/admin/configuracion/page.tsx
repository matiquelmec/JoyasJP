'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Store, Save, Loader2, Share2 } from 'lucide-react'
import { adminAPI } from '@/lib/admin-api'
import { toast } from 'sonner'
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
    instagram_url: '',
    tiktok_url: ''
  })

  useEffect(() => {
    loadConfiguration()
  }, [])

  const loadConfiguration = async () => {
    try {
      const data = await adminAPI.getConfiguration()
      setConfig(prev => ({
        ...prev,
        ...data,
        // Ensure new fields exist even if DB returns null initially
        instagram_url: data.instagram_url || '',
        tiktok_url: data.tiktok_url || ''
      }))
    } catch (error) {
      toast.error('Error', {
        description: 'No se pudo cargar la configuración',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Send only the relevant fields
      await adminAPI.updateConfiguration(config)

      // Refrescar la configuración en toda la aplicación
      await refreshConfig()

      toast.success('Configuración guardada', {
        description: `Los datos de la tienda se han actualizado correctamente.`
      })
    } catch (error) {
      toast.error('Error', {
        description: 'No se pudo guardar la configuración',
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
        <div className="absolute inset-0 bg-slate-100 rounded-2xl -z-10" />
        <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
            Identidad de la Marca
          </h1>
          <p className="mt-2 text-slate-600 font-medium text-lg">
            Personaliza cómo el mundo ve a tu tienda
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Información Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Información Esencial
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
                <Label htmlFor="store-slogan">Slogan de Marca</Label>
                <Input
                  id="store-slogan"
                  value={config.store_slogan || ''}
                  onChange={(e) => setConfig({ ...config, store_slogan: e.target.value })}
                  placeholder="Ej: Atrévete a jugar"
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
              <Label htmlFor="store-description">Descripción del Sitio (SEO)</Label>
              <Textarea
                id="store-description"
                value={config.store_description}
                onChange={(e) => setConfig({ ...config, store_description: e.target.value })}
                rows={3}
                placeholder="Breve descripción para Google y redes sociales."
              />
            </div>
          </CardContent>
        </Card>

        {/* Redes Sociales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Redes Sociales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="instagram-url">Instagram URL</Label>
                <Input
                  id="instagram-url"
                  value={config.instagram_url}
                  onChange={(e) => setConfig({ ...config, instagram_url: e.target.value })}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <Label htmlFor="tiktok-url">TikTok URL</Label>
                <Input
                  id="tiktok-url"
                  value={config.tiktok_url}
                  onChange={(e) => setConfig({ ...config, tiktok_url: e.target.value })}
                  placeholder="https://tiktok.com/..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white font-bold"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando Cambios...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Configuración
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}