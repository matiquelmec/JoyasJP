'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
  Clock
} from 'lucide-react'

export function ProductManual() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Manual de Subida de Productos
          </CardTitle>
          <p className="text-muted-foreground">
            Guía completa para agregar productos al catálogo de Joyas JP
          </p>
        </CardHeader>
      </Card>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🚀 Inicio Rápido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <span>Haz clic en <Badge variant="default">Agregar Producto</Badge></span>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <span>Completa los campos obligatorios (*)</span>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <span>Sube una imagen del producto</span>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">4</div>
              <span>Haz clic en <Badge variant="default">Crear Producto</Badge></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Required Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            Campos Obligatorios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <Tag className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Nombre del Producto *</h4>
                <p className="text-sm text-muted-foreground">
                  Nombre descriptivo del producto. Ej: "Cadena de Oro 18k con Dije Corazón"
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Tag className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Código del Producto *</h4>
                <p className="text-sm text-muted-foreground">
                  Código único del producto. Ejemplos: PCP_21, PDD_11, PCO_15
                </p>
                <Badge variant="outline" className="mt-1">Debe ser único - no se puede repetir</Badge>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Precio (CLP) *</h4>
                <p className="text-sm text-muted-foreground">
                  Precio en pesos chilenos, sin puntos ni comas. Ej: 120000
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Categoría *</h4>
                <p className="text-sm text-muted-foreground">Selecciona una categoría:</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">Cadenas</Badge>
                  <Badge variant="outline">Dijes</Badge>
                  <Badge variant="outline">Pulseras</Badge>
                  <Badge variant="outline">Aros</Badge>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Stock Inicial *</h4>
                <p className="text-sm text-muted-foreground">
                  Cantidad disponible para venta. Ej: 10
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Upload Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            Guía de Subida de Imágenes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <h4 className="font-medium">Recomendaciones</h4>
            </div>
            <ul className="text-sm space-y-1">
              <li>• <strong>Resolución:</strong> Mínimo 800x800px, ideal 1200x1200px</li>
              <li>• <strong>Formato:</strong> <Badge variant="secondary" className="text-xs">RECOMENDADO</Badge> WebP (mejor calidad/tamaño), también JPEG o PNG</li>
              <li>• <strong>Tamaño:</strong> Máximo 5MB</li>
              <li>• <strong>Fondo:</strong> Preferiblemente blanco o neutro</li>
              <li>• <strong>Iluminación:</strong> Bien iluminada, sin sombras fuertes</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-green-200 bg-green-50/50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-green-800">¿Por qué WebP?</h4>
            </div>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• <strong>Tamaño 25-35% menor</strong> que JPEG con la misma calidad</li>
              <li>• <strong>Carga más rápido</strong> - mejor experiencia para clientes</li>
              <li>• <strong>Soporta transparencias</strong> como PNG pero más liviano</li>
              <li>• <strong>Compatible</strong> con todos los navegadores modernos</li>
              <li>• <strong>Mismo proceso</strong> de subida, solo cambia la extensión</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-primary" />
              <h4 className="font-medium">Proceso Automático</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              La imagen se guarda automáticamente como <code className="bg-muted px-1 rounded">CODIGO_PRODUCTO.extensión</code> 
              en la carpeta de la categoría correspondiente.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              <strong>Ejemplos:</strong><br/>
              • Código "PCP_21" + imagen WebP → <code className="bg-muted px-1 rounded">Cadenas/PCP_21.webp</code><br/>
              • Código "PDD_11" + imagen JPEG → <code className="bg-muted px-1 rounded">Dijes/PDD_11.jpg</code>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Optional Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Campos Opcionales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Descripción</h4>
                <p className="text-sm text-muted-foreground">
                  Descripción detallada del producto, características especiales, etc.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Palette className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Materiales y Color</h4>
                <p className="text-sm text-muted-foreground">
                  Ej: "Plata 925", "Oro 18k", "Dorado", "Plateado"
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Ruler className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Dimensiones</h4>
                <p className="text-sm text-muted-foreground">
                  Medidas del producto. Ej: "2cm x 1.5cm", "Largo: 45cm"
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips and Warnings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💡 Consejos y Advertencias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <h4 className="font-medium">Códigos Duplicados</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              No se pueden crear productos con el mismo código. 
              Cada código debe ser único en todo el sistema.
            </p>
          </div>

          <div className="p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <h4 className="font-medium">URLs Automáticas</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Cada producto genera automáticamente una URL usando su código. 
              Ej: Código "PCP_21" → <code className="bg-muted px-1 rounded">/shop/PCP_21</code>
            </p>
          </div>

          <div className="p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-5 h-5 text-primary" />
              <h4 className="font-medium">Cambios Inmediatos</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Los productos aparecen inmediatamente en la tienda online. 
              No necesitas hacer nada adicional después de crearlos.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/50">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              <h4 className="font-medium">Sincronización Automática</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              <strong>IMPORTANTE:</strong> El sistema sincroniza automáticamente:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>URL del producto:</strong> /shop/CODIGO_PRODUCTO</li>
              <li>• <strong>Nombre de imagen:</strong> CODIGO_PRODUCTO.extensión</li>
              <li>• <strong>Ubicación:</strong> Carpeta de la categoría correspondiente</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">
              Esto evita inconvenientes y mantiene todo organizado automáticamente.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🔧 Solución de Problemas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="border-l-4 border-destructive pl-4">
              <h4 className="font-medium">Error: "Código duplicado"</h4>
              <p className="text-sm text-muted-foreground">
                Ya existe un producto con ese código. Usa un código diferente y único.
              </p>
            </div>

            <div className="border-l-4 border-destructive pl-4">
              <h4 className="font-medium">Error: "Archivo muy grande"</h4>
              <p className="text-sm text-muted-foreground">
                La imagen debe ser menor a 5MB. Comprime la imagen antes de subirla.
              </p>
            </div>

            <div className="border-l-4 border-destructive pl-4">
              <h4 className="font-medium">La imagen no se ve</h4>
              <p className="text-sm text-muted-foreground">
                Verifica que el formato sea WebP, JPEG o PNG y que la imagen no esté corrupta.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}