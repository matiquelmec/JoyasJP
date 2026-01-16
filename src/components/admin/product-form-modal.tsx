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
import { toast } from 'sonner'
import { ImageUpload } from './image-upload'

interface ProductFormModalProps {
  mode: 'create' | 'edit'
  product?: Product
  onSave: () => void
  trigger?: React.ReactNode
}

import { productConfig } from '@/lib/config'

// Categories are now derived from productConfig


export function ProductFormModal({ mode, product, onSave, trigger }: ProductFormModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    price: '',
    category: '',
    description: '',
    imageUrl: '',
    stock: '',
    materials: '',
    dimensions: '',
    color: '',
    detail: '',
    specifications: '',
    seo: ''
  })

  useEffect(() => {
    if (product && mode === 'edit') {
      // En modo edición, el código es el ID del producto si parece un código personalizado
      const productCode = product.id?.startsWith('P') ? product.id : ''

      setFormData({
        name: product.name || '',
        code: productCode, // Usar el ID como código si es un código personalizado
        price: product.price?.toString() || '',
        category: product.category || '',
        description: product.description || '',
        imageUrl: product.imageUrl || '',
        stock: product.stock?.toString() || '',
        materials: product.materials || '',
        dimensions: product.dimensions || '',
        color: product.color || '',
        detail: product.detail || '',
        specifications: product.specifications || '',
        seo: product.seo || ''
      })

    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        code: '',
        price: '',
        category: '',
        description: '',
        imageUrl: '',
        stock: '',
        materials: '',
        dimensions: '',
        color: '',
        detail: '',
        specifications: '',
        seo: ''
      })
    }
  }, [product, mode, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validación básica
      if (!formData.name.trim()) {
        toast.error('Error de validación', {
          description: 'El nombre del producto es requerido.',
        })
        setLoading(false)
        return
      }

      if (!formData.price || parseFloat(formData.price) <= 0) {
        toast.error('Error de validación', {
          description: 'El precio debe ser mayor a 0.',
        })
        setLoading(false)
        return
      }

      if (!formData.category) {
        toast.error('Error de validación', {
          description: 'La categoría es requerida.',
        })
        setLoading(false)
        return
      }

      if (!formData.stock || parseInt(formData.stock) < 0) {
        toast.error('Error de validación', {
          description: 'El stock debe ser 0 o mayor.',
        })
        setLoading(false)
        return
      }

      const productData = {
        name: formData.name,
        code: formData.code || null,
        price: parseFloat(formData.price),
        category: formData.category,
        description: formData.description || null,
        imageUrl: formData.imageUrl || null, // Database column is imageUrl
        stock: parseInt(formData.stock) || 0,
        materials: formData.materials || null,
        dimensions: formData.dimensions || null,
        color: formData.color || null,
        detail: formData.detail || null,
        specifications: formData.specifications || null,
        seo: formData.seo || null
        // Removed is_featured and is_deleted as they don't exist in database
      }

      let createdProduct = null
      if (mode === 'create') {
        createdProduct = await adminAPI.createProduct(productData)
      } else {
        await adminAPI.updateProduct(product?.id || '', productData)
      }

      toast.success(mode === 'create' ? 'Producto creado' : 'Producto actualizado', {
        description: `${formData.name} se ha ${mode === 'create' ? 'creado' : 'actualizado'} exitosamente.`,
      })

      // Show product info to user for new products
      if (mode === 'create' && createdProduct?.id) {
        toast.info('Producto creado exitosamente', {
          description: `ID del producto: ${createdProduct.id}`,
          duration: 5000,
        })
      }

      setOpen(false)
      onSave()
    } catch (error) {
      // Mensaje de error más específico
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

      toast.error('Error', {
        description: `No se pudo ${mode === 'create' ? 'crear' : 'actualizar'} el producto: ${errorMessage}`,
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" style={{ zIndex: 9999 }}>
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
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                }}
                required
                placeholder="Ej: Anillo de plata con diamante"
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
              />
            </div>
            <div>
              <Label htmlFor="code">
                Código del Producto {mode === 'edit' ? '(no editable)' : '(opcional)'}
              </Label>
              <input
                id="code"
                type="text"
                value={formData.code}
                onChange={(e) => mode === 'create' && setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder={mode === 'edit' ? 'El código no se puede cambiar' : "Ej: PCP_21, PDD_11 (si no lo llenas, se genera automático)"}
                className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ${mode === 'edit' ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white text-slate-900 border-slate-300'}`}
                readOnly={mode === 'edit'}
                disabled={mode === 'edit'}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Precio (CLP) *</Label>
              <input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                required
                placeholder="99000"
                min="0"
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stock">Stock Inicial *</Label>
              <input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                required
                placeholder="10"
                min="0"
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Categoría *</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              required
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
            >
              <option value="">Selecciona una categoría</option>
              {productConfig.categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <ImageUpload
            currentImage={formData.imageUrl}
            onImageUploaded={(imageUrl) => setFormData(prev => ({ ...prev, imageUrl }))}
            disabled={loading}
            category={formData.category}
            productCode={formData.code}
          />

          <div>
            <Label htmlFor="description">Descripción</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe las características principales del producto..."
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 resize-y"
            />
          </div>

          {/* Detalles adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="materials">Materiales</Label>
              <input
                id="materials"
                type="text"
                value={formData.materials}
                onChange={(e) => setFormData(prev => ({ ...prev, materials: e.target.value }))}
                placeholder="Ej: Plata 925, Oro 18k"
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
              />
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <select
                id="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
              >
                <option value="">Selecciona un color</option>
                {productConfig.colors.map(color => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="dimensions">Dimensiones</Label>
              <input
                id="dimensions"
                type="text"
                value={formData.dimensions}
                onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
                placeholder="Ej: 2cm x 1.5cm"
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="specifications" className="text-primary font-bold">Especificaciones Técnicas (Oro, Quilates, etc)</Label>
            <textarea
              id="specifications"
              value={formData.specifications}
              onChange={(e) => setFormData(prev => ({ ...prev, specifications: e.target.value }))}
              placeholder="Ej: Oro de 18k garantizado, Peso: 5g..."
              rows={2}
              className="flex min-h-[60px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary resize-y"
            />
          </div>

          <div>
            <Label htmlFor="seo">Palabras Clave SEO (Búsqueda)</Label>
            <input
              id="seo"
              type="text"
              value={formData.seo}
              onChange={(e) => setFormData(prev => ({ ...prev, seo: e.target.value }))}
              placeholder="Ej: anillo diamante, plata 925, joyas urbanas"
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
            />
          </div>

          <div>
            <Label htmlFor="detail">Cuidados y Detalles Adicionales</Label>
            <textarea
              id="detail"
              value={formData.detail}
              onChange={(e) => setFormData(prev => ({ ...prev, detail: e.target.value }))}
              placeholder="Información adicional, cuidados, etc..."
              rows={2}
              className="flex min-h-[60px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 resize-y"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant={"outline" as any}
              onClick={() => setOpen(false)}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white font-bold">
              <Save className="w-4 h-4 mr-2" />
              {loading
                ? (mode === 'create' ? 'Creando...' : 'Guardando...')
                : (mode === 'create' ? 'Confirmar y Publicar' : 'Guardar Cambios')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}