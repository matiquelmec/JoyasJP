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
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <span>Haz clic en <Badge variant="default">Agregar Producto</Badge></span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <span>Completa los campos obligatorios (*)</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <span>Sube una imagen del producto</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
              <span>Haz clic en <Badge variant="default">Crear Producto</Badge></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Required Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Campos Obligatorios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <Tag className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Nombre del Producto *</h4>
                <p className="text-sm text-muted-foreground">
                  Nombre descriptivo y único. Ej: "Cadena de Oro 18k con Dije Corazón"
                </p>
                <Badge variant="outline" className="mt-1">Debe ser único por categoría</Badge>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Precio (CLP) *</h4>
                <p className="text-sm text-muted-foreground">
                  Precio en pesos chilenos, sin puntos ni comas. Ej: 120000
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Categoría *</h4>
                <p className="text-sm text-muted-foreground">Selecciona una categoría:</p>
                <div className="flex gap-2 mt-2">
                  <Badge>Cadenas</Badge>
                  <Badge>Dijes</Badge>
                  <Badge>Pulseras</Badge>
                  <Badge>Aros</Badge>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-orange-600 mt-0.5" />
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
            <ImageIcon className="w-5 h-5 text-indigo-600" />
            Guía de Subida de Imágenes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-green-800">Recomendaciones</h4>
            </div>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• <strong>Resolución:</strong> Mínimo 800x800px, ideal 1200x1200px</li>
              <li>• <strong>Formato:</strong> JPEG (mejor compresión) o PNG</li>
              <li>• <strong>Tamaño:</strong> Máximo 5MB</li>
              <li>• <strong>Fondo:</strong> Preferiblemente blanco o neutro</li>
              <li>• <strong>Iluminación:</strong> Bien iluminada, sin sombras fuertes</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-800">Proceso Automático</h4>
            </div>
            <p className="text-sm text-blue-700">
              La imagen se guarda automáticamente como <code className="bg-blue-100 px-1 rounded">nombre-producto.jpg</code> 
              en la carpeta de la categoría correspondiente.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Optional Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            Campos Opcionales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Descripción</h4>
                <p className="text-sm text-muted-foreground">
                  Descripción detallada del producto, características especiales, etc.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Palette className="w-5 h-5 text-pink-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Materiales y Color</h4>
                <p className="text-sm text-muted-foreground">
                  Ej: "Plata 925", "Oro 18k", "Dorado", "Plateado"
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Ruler className="w-5 h-5 text-teal-600 mt-0.5" />
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
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <h4 className="font-medium text-yellow-800">Productos Duplicados</h4>
            </div>
            <p className="text-sm text-yellow-700">
              No se pueden crear productos con el mismo nombre en la misma categoría. 
              El sistema te alertará si intentas crear un duplicado.
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-green-800">URLs Automáticas</h4>
            </div>
            <p className="text-sm text-green-700">
              Cada producto genera automáticamente una URL amigable. 
              Ej: "Cadena de Oro 18k" → <code className="bg-green-100 px-1 rounded">/shop/cadena-de-oro-18k</code>
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-800">Cambios Inmediatos</h4>
            </div>
            <p className="text-sm text-blue-700">
              Los productos aparecen inmediatamente en la tienda online. 
              No necesitas hacer nada adicional después de crearlos.
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
            <div className="border-l-4 border-red-400 pl-4">
              <h4 className="font-medium text-red-800">Error: "Producto duplicado"</h4>
              <p className="text-sm text-red-600">
                Ya existe un producto con ese nombre en esa categoría. Cambia el nombre o la categoría.
              </p>
            </div>

            <div className="border-l-4 border-orange-400 pl-4">
              <h4 className="font-medium text-orange-800">Error: "Archivo muy grande"</h4>
              <p className="text-sm text-orange-600">
                La imagen debe ser menor a 5MB. Comprime la imagen antes de subirla.
              </p>
            </div>

            <div className="border-l-4 border-yellow-400 pl-4">
              <h4 className="font-medium text-yellow-800">La imagen no se ve</h4>
              <p className="text-sm text-yellow-600">
                Verifica que el formato sea JPEG o PNG y que la imagen no esté corrupta.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}