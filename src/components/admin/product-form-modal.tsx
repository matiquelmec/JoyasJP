'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Save, X } from 'lucide-react'
import type { Product } from '@/lib/types'
import { adminAPI } from '@/lib/admin-api'
import { toast } from '@/hooks/use-toast'
import { ImageUpload } from './image-upload'

interface ProductFormModalProps {
  mode: 'create' | 'edit'
  product?: Product
  onSave: () => void
  trigger?: React.ReactNode
}

const categories = [
  'cadenas',
  'dijes', 
  'pulseras',
  'aros'
]

export function ProductFormModal({ mode, product, onSave, trigger }: ProductFormModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    imageUrl: '',
    stock: '',
    materials: '',
    dimensions: '',
    color: '',
    detail: ''
  })

  useEffect(() => {
    if (product && mode === 'edit') {
      setFormData({
        name: product.name || '',
        price: product.price?.toString() || '',
        category: product.category || '',
        description: product.description || '',
        imageUrl: product.imageUrl || '',
        stock: product.stock?.toString() || '',
        materials: product.materials || '',
        dimensions: product.dimensions || '',
        color: product.color || '',
        detail: product.detail || ''
      })
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        price: '',
        category: '',
        description: '',
        imageUrl: '',
        stock: '',
        materials: '',
        dimensions: '',
        color: '',
        detail: ''
      })
    }
  }, [product, mode, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        description: formData.description || null,
        imageUrl: formData.imageUrl || null,
        stock: parseInt(formData.stock) || 0,
        materials: formData.materials || null,
        dimensions: formData.dimensions || null,
        color: formData.color || null,
        detail: formData.detail || null
      }

      let createdProduct = null
      if (mode === 'create') {
        createdProduct = await adminAPI.createProduct(productData)
      } else {
        await adminAPI.updateProduct(product?.id || '', productData)
      }

      toast({
        title: mode === 'create' ? 'Producto creado' : 'Producto actualizado',
        description: `${formData.name} se ha ${mode === 'create' ? 'creado' : 'actualizado'} exitosamente.`,
      })

      // Show product info to user for new products
      if (mode === 'create' && createdProduct?.id) {
        toast({
          title: 'Producto creado exitosamente',
          description: `ID del producto: ${createdProduct.id}`,
          duration: 5000,
        })
      }

      setOpen(false)
      onSave()
    } catch (error) {
      console.error('Error saving product:', error)
      toast({
        title: 'Error',
        description: `No se pudo ${mode === 'create' ? 'crear' : 'actualizar'} el producto. Intenta nuevamente.`,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const defaultTrigger = (
    <Button className="flex items-center gap-2">
      <Plus className="w-4 h-4" />
      Agregar Producto
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Crear Nuevo Producto' : `Editar: ${product?.name || 'Producto'}`}
          </DialogTitle>
          {mode === 'edit' && (
            <p className="text-sm text-muted-foreground">
              ID: {product?.id} • Modifica los campos que necesites actualizar
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre del Producto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="Ej: Anillo de plata con diamante"
              />
            </div>
            <div>
              <Label htmlFor="price">Precio (CLP) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                required
                placeholder="99000"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stock">Stock Inicial *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                required
                placeholder="10"
                min="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Categoría *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ImageUpload
            currentImage={formData.imageUrl}
            onImageUploaded={(imageUrl) => setFormData(prev => ({ ...prev, imageUrl }))}
            disabled={loading}
            category={formData.category}
          />

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe las características principales del producto..."
              rows={3}
            />
          </div>

          {/* Detalles adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="materials">Materiales</Label>
              <Input
                id="materials"
                value={formData.materials}
                onChange={(e) => setFormData(prev => ({ ...prev, materials: e.target.value }))}
                placeholder="Ej: Plata 925, Oro 18k"
              />
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                placeholder="Ej: Dorado, Plateado"
              />
            </div>
            <div>
              <Label htmlFor="dimensions">Dimensiones</Label>
              <Input
                id="dimensions"
                value={formData.dimensions}
                onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
                placeholder="Ej: 2cm x 1.5cm"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="detail">Detalles Adicionales</Label>
            <Textarea
              id="detail"
              value={formData.detail}
              onChange={(e) => setFormData(prev => ({ ...prev, detail: e.target.value }))}
              placeholder="Información adicional, cuidados, etc..."
              rows={2}
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading 
                ? (mode === 'create' ? 'Creando...' : 'Guardando...') 
                : (mode === 'create' ? 'Crear Producto' : 'Guardar Cambios')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}