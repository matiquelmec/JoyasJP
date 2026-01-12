'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useSiteConfig } from '@/hooks/use-site-config'
import { 
  BookOpen, 
  Upload, 
  Image as ImageIcon, 
  Tag, 
  DollarSign, 
  Package, 
  AlertCircle, 
  CheckCircle,
  FileText,
  Palette,
  Ruler,
  Clock,
  ShoppingCart,
  Settings,
  BarChart3,
  Users,
  Mail,
  Truck,
  CreditCard,
  Globe,
  Shield,
  Smartphone,
  Monitor,
  Zap,
  Star
} from 'lucide-react'

export function CompleteManual() {
  const { config } = useSiteConfig()
  const storeName = config?.store_name || 'Joyas JP'

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <BookOpen className="w-8 h-8 text-primary" />
            Manual Completo de {storeName}
          </CardTitle>
          <p className="text-muted-foreground text-lg">
            Guía completa para administrar tu e-commerce de alta joyería urbana
          </p>
        </CardHeader>
      </Card>


      {/* Sección 1: Productos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Package className="w-6 h-6 text-primary" />
            1. Gestión de Productos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Agregar Producto */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Agregar Nuevo Producto
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <span>Ve a <strong>Admin → Productos</strong></span>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <span>Click en <Badge variant="default">Agregar Producto</Badge></span>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <span>Completa todos los campos obligatorios (*)</span>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <span>Sube una imagen (recomendado: WebP)</span>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">5</div>
                <span>Click <Badge variant="default">Crear Producto</Badge></span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Campos Obligatorios */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Campos Obligatorios
            </h3>
            <div className="grid gap-4">
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Tag className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium">Nombre del Producto *</h4>
                  <p className="text-sm text-muted-foreground">
                    Ejemplo: "Cadena Cubana Oro 18k - 45cm"
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <FileText className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium">Código del Producto (opcional)</h4>
                  <p className="text-sm text-muted-foreground">
                    Si no lo llenas, se genera automáticamente. Ejemplos: PCP_21, PDD_11
                  </p>
                  <Badge variant="outline" className="mt-1">Se genera URL: /shop/PCP_21</Badge>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <DollarSign className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium">Precio (CLP) *</h4>
                  <p className="text-sm text-muted-foreground">
                    Solo números, sin puntos ni comas. Ejemplo: 85000
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Package className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium">Categoría * | Stock *</h4>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">Cadenas</Badge>
                    <Badge variant="outline">Dijes</Badge>
                    <Badge variant="outline">Pulseras</Badge>
                    <Badge variant="outline">Aros</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Imágenes */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              Guía de Imágenes
            </h3>
            <div className="p-4 rounded-lg border border-green-200 bg-green-50/50 dark:bg-green-950/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-green-800 dark:text-green-200">Recomendaciones</h4>
              </div>
              <ul className="text-sm space-y-1 text-green-700 dark:text-green-300">
                <li>• <strong>Formato:</strong> WebP (recomendado), JPEG o PNG</li>
                <li>• <strong>Resolución:</strong> Mínimo 800x800px, ideal 1200x1200px</li>
                <li>• <strong>Tamaño:</strong> Máximo 5MB</li>
                <li>• <strong>Fondo:</strong> Blanco o neutro para mejor presentación</li>
                <li>• <strong>Guardado automático:</strong> Se guarda como CODIGO_PRODUCTO.extensión</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección 2: Pedidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ShoppingCart className="w-6 h-6 text-primary" />
            2. Gestión de Pedidos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Flujo de Pedidos</h3>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <span className="font-medium">Pendiente</span>
                  <p className="text-sm text-muted-foreground">Cliente realizó pedido, pago en proceso</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <span className="font-medium">Procesando</span>
                  <p className="text-sm text-muted-foreground">Preparando el pedido para envío</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <span className="font-medium">Enviado</span>
                  <p className="text-sm text-muted-foreground">Producto en camino al cliente</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-50/50 dark:bg-green-950/20">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <div>
                  <span className="font-medium">Entregado</span>
                  <p className="text-sm text-muted-foreground">Cliente recibió el producto</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3">Gestionar Pedidos</h3>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg bg-muted/50">
                <p className="text-sm">
                  <strong>1. Ve a Admin → Pedidos</strong> para ver todos los pedidos
                </p>
              </div>
              <div className="p-3 border rounded-lg bg-muted/50">
                <p className="text-sm">
                  <strong>2. Cambia estados</strong> usando los botones de cada pedido
                </p>
              </div>
              <div className="p-3 border rounded-lg bg-muted/50">
                <p className="text-sm">
                  <strong>3. Ve estadísticas</strong> en tiempo real en el dashboard
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección 3: Configuración */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Settings className="w-6 h-6 text-primary" />
            3. Configuración General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-800 dark:text-blue-200">Configuración Centralizada</h4>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Todos los cambios se aplican automáticamente en toda la tienda.
              No necesitas refrescar ni hacer nada adicional.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Configuraciones Disponibles</h3>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Globe className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium">Información de la Tienda</h4>
                  <p className="text-sm text-muted-foreground">
                    Nombre, email, descripción - se muestra en footer y toda la web
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Truck className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium">Configuración de Envíos</h4>
                  <p className="text-sm text-muted-foreground">
                    Costo de envío, envío gratis desde, zonas de envío
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <CreditCard className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium">MercadoPago</h4>
                  <p className="text-sm text-muted-foreground">
                    Credenciales de pago (ya configurado y funcionando)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Mail className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium">Notificaciones</h4>
                  <p className="text-sm text-muted-foreground">
                    Configurar qué notificaciones recibir
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección 4: Dashboard y Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <BarChart3 className="w-6 h-6 text-primary" />
            4. Dashboard y Estadísticas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-3">Métricas en Tiempo Real</h3>
            <div className="grid gap-3">
              <div className="p-3 border rounded-lg bg-muted/50">
                <p className="text-sm">
                  <strong>Inventario:</strong> Total de productos, alertas de stock bajo, valor del inventario
                </p>
              </div>
              <div className="p-3 border rounded-lg bg-muted/50">
                <p className="text-sm">
                  <strong>Pedidos:</strong> Estados de pedidos, ingresos totales, pedidos por procesar
                </p>
              </div>
              <div className="p-3 border rounded-lg bg-muted/50">
                <p className="text-sm">
                  <strong>Productos Destacados:</strong> Los productos marcados como destacados aparecen primero
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección 5: Experiencia del Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Users className="w-6 h-6 text-primary" />
            5. Experiencia del Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-3">Funcionalidades Disponibles</h3>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 border rounded-lg bg-green-50/50 dark:bg-green-950/20">
                <ShoppingCart className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200">Carrito de Compras</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Persistente entre sesiones, cálculo automático de envío
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border rounded-lg bg-green-50/50 dark:bg-green-950/20">
                <Star className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200">Lista de Favoritos</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Los clientes pueden guardar productos favoritos
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border rounded-lg bg-green-50/50 dark:bg-green-950/20">
                <CreditCard className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200">Checkout Completo</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Integrado con MercadoPago, guarda automáticamente pedidos
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border rounded-lg bg-green-50/50 dark:bg-green-950/20">
                <Smartphone className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200">Responsive Design</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Funciona perfectamente en móviles, tablets y desktop
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección 6: Consejos y Mejores Prácticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Shield className="w-6 h-6 text-primary" />
            6. Consejos y Mejores Prácticas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-4 rounded-lg border border-green-200 bg-green-50/50 dark:bg-green-950/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-green-800 dark:text-green-200">Gestión de Inventario</h4>
              </div>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• Mantén el stock actualizado para evitar sobreventa</li>
                <li>• Usa descripciones detalladas para mejorar las ventas</li>
                <li>• Marca productos como "Destacados" para promocionarlos</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
              <div className="flex items-center gap-2 mb-2">
                <Monitor className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-blue-800 dark:text-blue-200">Imágenes de Calidad</h4>
              </div>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Usa imágenes con buena iluminación y fondo neutro</li>
                <li>• Prefiere formato WebP para mejor rendimiento</li>
                <li>• Mantén consistencia en el estilo de fotografía</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Atención al Cliente</h4>
              </div>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• Procesa los pedidos rápidamente para mejor experiencia</li>
                <li>• Mantén la información de contacto actualizada</li>
                <li>• Revisa regularmente el dashboard para nuevos pedidos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer del Manual */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">¡Tu tienda está lista para vender!</h3>
            <p className="text-muted-foreground">
              Sistema completo de e-commerce con todos los componentes necesarios para el éxito de {storeName}
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Badge variant="secondary">✅ Productos</Badge>
              <Badge variant="secondary">✅ Pedidos</Badge>
              <Badge variant="secondary">✅ Pagos</Badge>
              <Badge variant="secondary">✅ Configuración</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}