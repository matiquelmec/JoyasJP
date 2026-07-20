'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Save, X, Plus } from 'lucide-react'
import { adminAPI } from '@/lib/admin-api'
import { toast } from 'sonner'

interface Coupon {
  code: string
  discount_type: string
  discount_value: number
  min_cart_amount: number
  usage_limit: number | null
  usage_count: number
  expires_at: string | null
  is_active: boolean
  affiliate_name: string | null
  total_orders?: number
  total_sales?: number
}

interface CouponFormModalProps {
  mode: 'create' | 'edit'
  coupon?: Coupon
  onSave: () => void
  trigger?: React.ReactNode
}

export function CouponFormModal({ mode, coupon, onSave, trigger }: CouponFormModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_cart_amount: '',
    usage_limit: '',
    expires_at: '',
    is_active: true,
    is_affiliate: false,
    affiliate_name: ''
  })

  useEffect(() => {
    if (coupon && mode === 'edit') {
      // Formatear fecha para el input type="date"
      let formattedDate = ''
      if (coupon.expires_at) {
        formattedDate = coupon.expires_at.split('T')[0]
      }

      setFormData({
        code: coupon.code || '',
        discount_type: coupon.discount_type || 'percentage',
        discount_value: coupon.discount_value?.toString() || '',
        min_cart_amount: coupon.min_cart_amount?.toString() || '',
        usage_limit: coupon.usage_limit?.toString() || '',
        expires_at: formattedDate,
        is_active: coupon.is_active || false,
        is_affiliate: !!coupon.affiliate_name,
        affiliate_name: coupon.affiliate_name || ''
      })
    } else {
      // Reset form
      setFormData({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        min_cart_amount: '',
        usage_limit: '',
        expires_at: '',
        is_active: true,
        is_affiliate: false,
        affiliate_name: ''
      })
    }
  }, [coupon, mode, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.code.trim()) {
        toast.error('Error de validación', { description: 'El código del cupón es requerido.' })
        setLoading(false)
        return
      }

      if (!formData.discount_value || parseFloat(formData.discount_value) <= 0) {
        toast.error('Error de validación', { description: 'El valor de descuento debe ser mayor a 0.' })
        setLoading(false)
        return
      }

      if (formData.discount_type === 'percentage' && parseFloat(formData.discount_value) > 100) {
        toast.error('Error de validación', { description: 'El porcentaje de descuento no puede superar el 100%.' })
        setLoading(false)
        return
      }

      if (formData.is_affiliate && !formData.affiliate_name.trim()) {
        toast.error('Error de validación', { description: 'Ingresa el nombre o alias del afiliado.' })
        setLoading(false)
        return
      }

      const couponData = {
        code: formData.code.trim().toUpperCase(),
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        min_cart_amount: parseFloat(formData.min_cart_amount) || 0,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        expires_at: formData.expires_at || null,
        is_active: formData.is_active,
        affiliate_name: formData.is_affiliate ? formData.affiliate_name.trim() : null
      }

      if (mode === 'create') {
        await adminAPI.createCoupon(couponData)
      } else {
        await adminAPI.updateCoupon(couponData)
      }

      toast.success(mode === 'create' ? 'Cupón creado' : 'Cupón actualizado', {
        description: `El código ${formData.code.toUpperCase()} se ha guardado exitosamente.`,
      })

      setOpen(false)
      onSave()
    } catch (error: any) {
      toast.error('Error', {
        description: error.message || `No se pudo ${mode === 'create' ? 'crear' : 'actualizar'} el cupón.`,
      })
    } finally {
      setLoading(false)
    }
  }

  const defaultTrigger = (
    <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold">
      <Plus className="w-4 h-4" />
      Crear Cupón / Afiliado
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto shadow-2xl" style={{ zIndex: 9999 }}>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Crear Nuevo Cupón o Afiliado' : `Editar: ${coupon?.code}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="code">Código del Cupón *</Label>
            <input
              id="code"
              type="text"
              value={formData.code}
              onChange={(e) => mode === 'create' && setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              required
              readOnly={mode === 'edit'}
              disabled={mode === 'edit'}
              placeholder="Ej: SCENE10, REGALO2026"
              className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm uppercase ${mode === 'edit' ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' : 'bg-white text-slate-900 border-slate-300 focus:border-slate-500'}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="discount_type">Tipo de Descuento</Label>
              <select
                id="discount_type"
                value={formData.discount_type}
                onChange={(e) => setFormData(prev => ({ ...prev, discount_type: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed">Monto Fijo ($)</option>
              </select>
            </div>
            <div>
              <Label htmlFor="discount_value">Valor Descuento *</Label>
              <input
                id="discount_value"
                type="number"
                value={formData.discount_value}
                onChange={(e) => setFormData(prev => ({ ...prev, discount_value: e.target.value }))}
                required
                placeholder={formData.discount_type === 'percentage' ? '15' : '5000'}
                min="1"
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_cart_amount">Compra Mínima ($)</Label>
              <input
                id="min_cart_amount"
                type="number"
                value={formData.min_cart_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, min_cart_amount: e.target.value }))}
                placeholder="0"
                min="0"
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </div>
            <div>
              <Label htmlFor="usage_limit">Límite de Usos (Opcional)</Label>
              <input
                id="usage_limit"
                type="number"
                value={formData.usage_limit}
                onChange={(e) => setFormData(prev => ({ ...prev, usage_limit: e.target.value }))}
                placeholder="Ilimitado"
                min="1"
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="expires_at">Fecha de Expiración</Label>
            <input
              id="expires_at"
              type="date"
              value={formData.expires_at}
              onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            />
          </div>

          <div className="p-3 border border-slate-200 rounded-lg bg-slate-50 space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_affiliate"
                checked={formData.is_affiliate}
                onChange={(e) => setFormData(prev => ({ ...prev, is_affiliate: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300 text-primary"
              />
              <Label htmlFor="is_affiliate" className="font-bold text-xs text-amber-700 cursor-pointer">
                👥 Vincular código a un Afiliado / Influencer
              </Label>
            </div>

            {formData.is_affiliate && (
              <div>
                <Label htmlFor="affiliate_name" className="text-xs">Nombre o Red Social del Afiliado</Label>
                <input
                  id="affiliate_name"
                  type="text"
                  value={formData.affiliate_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, affiliate_name: e.target.value }))}
                  placeholder="Ej: Mateo Riquelme (@mateo_style)"
                  required={formData.is_affiliate}
                  className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-xs text-slate-900 focus:border-slate-500"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="w-4 h-4 rounded border-slate-300 text-primary"
            />
            <Label htmlFor="is_active" className="font-bold text-xs cursor-pointer">
              🟢 Cupón Activo y Habilitado para Clientes
            </Label>
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
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white font-bold">
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Guardando...' : (mode === 'create' ? 'Crear Cupón' : 'Guardar Cambios')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
