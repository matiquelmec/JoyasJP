'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { 
  Eye, 
  Edit, 
  Package, 
  DollarSign, 
  Palette, 
  Ruler, 
  Gem,
  FileText,
  Image as ImageIcon
} from 'lucide-react'
import type { Product } from '@/lib/types'
import { ProductFormModal } from './product-form-modal'

interface ProductDetailsModalProps {
  product: Product
  onSave: () => void
  trigger?: React.ReactNode
}

export function ProductDetailsModal({ product, onSave, trigger }: ProductDetailsModalProps) {
  const [open, setOpen] = useState(false)

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return { text: 'Agotado', variant: 'destructive' as const, color: 'text-red-600' }
    } else if (stock <= 5) {
      return { text: 'Stock Bajo', variant: 'secondary' as const, color: 'text-orange-600' }
    } else if (stock <= 10) {
      return { text: 'Stock Medio', variant: 'outline' as const, color: 'text-yellow-600' }
    } else {
      return { text: 'En Stock', variant: 'default' as const, color: 'text-green-600' }
    }
  }

  const stockStatus = getStockStatus(product.stock || 0)

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="w-full justify-start">
      <Eye className="mr-2 h-4 w-4" />
      Ver detalles completos
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Imagen del Producto */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg border-2 border-dashed border-gray-200 overflow-hidden bg-gray-50 relative">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <ImageIcon className="w-16 h-16 mx-auto mb-2" />
                    <p>Sin imagen</p>
                  </div>
                </div>
              )}
            </div>
            
            {product.imageUrl && (
              <div className="text-xs text-gray-500 break-all">
                <strong>URL:</strong> {product.imageUrl}
              </div>
            )}
          </div>

          {/* Información del Producto */}
          <div className="space-y-6">
            {/* Información Básica */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Información Básica
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Precio:</span>
                  <span className="text-xl font-bold text-green-600 flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {formatCLP(product.price)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Categoría:</span>
                  <Badge variant="outline" className="capitalize">
                    {product.category}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Stock:</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${stockStatus.color}`}>
                      {product.stock || 0} unidades
                    </span>
                    <Badge variant={stockStatus.variant}>
                      {stockStatus.text}
                    </Badge>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Valor Total en Stock:</span>
                  <span className="font-bold text-blue-600">
                    {formatCLP((product.price || 0) * (product.stock || 0))}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Características Físicas */}
            {(product.materials || product.color || product.dimensions) && (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Gem className="w-5 h-5 mr-2" />
                    Características
                  </h3>
                  <div className="space-y-3">
                    {product.materials && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Materiales:</span>
                        <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          {product.materials}
                        </span>
                      </div>
                    )}
                    
                    {product.color && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600 flex items-center">
                          <Palette className="w-4 h-4 mr-1" />
                          Color:
                        </span>
                        <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          {product.color}
                        </span>
                      </div>
                    )}
                    
                    {product.dimensions && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600 flex items-center">
                          <Ruler className="w-4 h-4 mr-1" />
                          Dimensiones:
                        </span>
                        <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          {product.dimensions}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Descripciones */}
            {(product.description || product.detail) && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Descripciones
                </h3>
                <div className="space-y-4">
                  {product.description && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Descripción Principal:</h4>
                      <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  )}
                  
                  {product.detail && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Detalles Adicionales:</h4>
                      <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg leading-relaxed">
                        {product.detail}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ID del Producto */}
            <div className="pt-4 border-t">
              <p className="text-xs text-gray-400">
                <strong>ID del Producto:</strong> {product.id}
              </p>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-end gap-3 pt-6 border-t mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}