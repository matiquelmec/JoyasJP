'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Tag,
  Users,
  TrendingUp,
  Percent,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  DollarSign
} from 'lucide-react'
import { adminAPI } from '@/lib/admin-api'
import { toast } from 'sonner'
import { CouponFormModal } from './coupon-form-modal'

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
  created_at: string
  total_orders: number
  total_sales: number
}

export function CouponsManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'campaign' | 'affiliate'>('all')
  const [deleteCode, setDeleteCode] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [commissionRate, setCommissionRate] = useState<number>(10) // Porcentaje de comisión sugerido

  useEffect(() => {
    loadCoupons()
  }, [])

  const loadCoupons = async () => {
    try {
      const data = await adminAPI.getCoupons()
      setCoupons(data || [])
    } catch (error) {
      toast.error('Error', {
        description: 'No se pudieron cargar los cupones.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCoupon = async () => {
    if (!deleteCode) return
    setDeleting(true)
    try {
      await adminAPI.deleteCoupon(deleteCode)
      setCoupons(prev => prev.filter(c => c.code !== deleteCode))
      toast.success('Cupón eliminado', {
        description: `El código ${deleteCode} ha sido eliminado permanentemente.`,
      })
    } catch (error) {
      toast.error('Error', {
        description: 'No se pudo eliminar el cupón.',
      })
    } finally {
      setDeleting(false)
      setDeleteCode(null)
    }
  }

  const toggleCouponStatus = async (coupon: Coupon) => {
    try {
      const updated = {
        ...coupon,
        is_active: !coupon.is_active
      }
      await adminAPI.updateCoupon(updated)
      setCoupons(prev => prev.map(c => c.code === coupon.code ? { ...c, is_active: !c.is_active } : c))
      toast.success('Estado actualizado', {
        description: `El cupón ${coupon.code} ha sido ${!coupon.is_active ? 'activado' : 'desactivado'}.`,
      })
    } catch (error) {
      toast.error('Error', {
        description: 'No se pudo actualizar el estado del cupón.',
      })
    }
  }

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Filtrar cupones
  const filteredCoupons = useMemo(() => {
    return coupons.filter(c => {
      const matchesSearch = c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.affiliate_name && c.affiliate_name.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesType = filterType === 'all' ||
        (filterType === 'campaign' && !c.affiliate_name) ||
        (filterType === 'affiliate' && c.affiliate_name)

      return matchesSearch && matchesType
    })
  }, [coupons, searchTerm, filterType])

  // Métricas agregadas
  const metrics = useMemo(() => {
    const active = coupons.filter(c => c.is_active).length
    const totalSales = coupons.reduce((sum, c) => sum + (c.total_sales || 0), 0)
    const totalOrders = coupons.reduce((sum, c) => sum + (c.total_orders || 0), 0)
    const affiliatesCount = coupons.filter(c => c.affiliate_name).length

    return { active, totalSales, totalOrders, affiliatesCount }
  }, [coupons])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-pulse text-muted-foreground uppercase tracking-widest font-black">Cargando Cupones...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black font-headline uppercase tracking-tighter text-slate-900">Cupones y Afiliados</h1>
          <p className="text-slate-600 font-medium">Gestiona códigos de campaña y comisiones de influencers.</p>
        </div>
        <CouponFormModal mode="create" onSave={loadCoupons} />
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: 'Cupones Activos', value: metrics.active, icon: Tag, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Ventas Generadas', value: formatCLP(metrics.totalSales), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Uso en Pedidos', value: metrics.totalOrders, icon: Percent, color: 'text-purple-600', bg: 'bg-purple-100' },
          { label: 'Afiliados / Influencers', value: metrics.affiliatesCount, icon: Users, color: 'text-amber-600', bg: 'bg-amber-100' }
        ].map((stat, i) => (
          <Card key={i} className="border-slate-200 shadow-sm hover:shadow-lg transition-all bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controles de Filtrado */}
      <Card className="border-slate-200 shadow-xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-950 text-white p-6 border-b border-slate-900">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <CardTitle className="text-xl font-black uppercase tracking-widest">Códigos de Descuento</CardTitle>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Input
                placeholder="Buscar código o afiliado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white text-xs h-9 w-full sm:w-48 placeholder:text-zinc-500"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="bg-zinc-900 border-zinc-800 text-white text-xs p-2 rounded-md h-9 focus:ring-1 focus:ring-primary w-full sm:w-auto"
              >
                <option value="all">TODOS LOS CÓDIGOS</option>
                <option value="campaign">CAMPAÑAS GENERALES</option>
                <option value="affiliate">AFILIADOS / INFLUENCERS</option>
              </select>

              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-white rounded-md px-2 h-9 text-xs w-full sm:w-auto">
                <span className="opacity-60 text-[10px] font-bold uppercase shrink-0">% Comisión:</span>
                <input
                  type="number"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Math.max(0, parseInt(e.target.value) || 0))}
                  className="bg-transparent text-white w-10 text-center font-bold outline-none"
                  min="0"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-100 border-b border-slate-200">
                <TableRow className="hover:bg-slate-100">
                  <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4 pl-6 text-slate-700">Código / Afiliado</TableHead>
                  <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4 text-slate-700">Descuento</TableHead>
                  <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4 text-slate-700">Usos</TableHead>
                  <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4 text-slate-700">Ventas Generadas</TableHead>
                  <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4 text-slate-700">Comisión Sugerida</TableHead>
                  <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4 text-slate-700">Expiración</TableHead>
                  <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4 text-slate-700">Estado</TableHead>
                  <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4 text-slate-700 text-right pr-6">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-slate-400 font-medium italic">
                      No se encontraron cupones con los filtros seleccionados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCoupons.map((c) => {
                    const commission = (c.total_sales || 0) * (commissionRate / 100)
                    
                    return (
                      <TableRow key={c.code} className="hover:bg-slate-50 transition-colors border-slate-100">
                        <TableCell className="py-4 pl-6">
                          <div className="flex flex-col">
                            <span className="font-mono font-bold text-sm text-zinc-950">{c.code}</span>
                            {c.affiliate_name ? (
                              <span className="text-[10px] text-amber-700 font-bold flex items-center gap-1 mt-0.5">
                                👥 Afiliado: {c.affiliate_name}
                              </span>
                            ) : (
                              <span className="text-[10px] text-zinc-400 mt-0.5">Campaña General</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {c.discount_type === 'percentage' ? (
                            <Badge className="bg-blue-100 hover:bg-blue-100 text-blue-800 border-none font-bold text-xs">
                              {c.discount_value}% OFF
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-800 border-none font-bold text-xs">
                              {formatCLP(c.discount_value)} OFF
                            </Badge>
                          )}
                          {c.min_cart_amount > 0 && (
                            <p className="text-[9px] text-zinc-400 mt-1">Mín: {formatCLP(c.min_cart_amount)}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-zinc-800">
                              {c.usage_count} / {c.usage_limit || '∞'}
                            </span>
                            {c.usage_limit && (
                              <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                                <div 
                                  className="bg-primary h-full" 
                                  style={{ width: `${Math.min(100, (c.usage_count / c.usage_limit) * 100)}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-sm text-zinc-900">
                          {formatCLP(c.total_sales || 0)}
                          <p className="text-[9px] text-zinc-400 mt-0.5">{c.total_orders || 0} compras</p>
                        </TableCell>
                        <TableCell>
                          {c.affiliate_name ? (
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-amber-700">{formatCLP(commission)}</span>
                              <span className="text-[9px] text-zinc-400 font-bold">{commissionRate}% de ventas</span>
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-300 italic">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-zinc-600">
                          {c.expires_at ? (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 opacity-55" />
                              {c.expires_at.split('T')[0]}
                            </span>
                          ) : (
                            <span className="text-zinc-300">Nunca</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <button 
                            type="button"
                            onClick={() => toggleCouponStatus(c)}
                            className="focus:outline-none"
                          >
                            {c.is_active ? (
                              <Badge className="bg-green-600 hover:bg-green-700 text-white border-none font-bold text-[10px] cursor-pointer">
                                ACTIVO
                              </Badge>
                            ) : (
                              <Badge className="bg-red-500 hover:bg-red-600 text-white border-none font-bold text-[10px] cursor-pointer">
                                INACTIVO
                              </Badge>
                            )}
                          </button>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon" className="h-8 w-8 border-slate-300 bg-white">
                                <MoreHorizontal className="h-4 w-4 text-slate-700" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36 p-1">
                              <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                <CouponFormModal
                                  mode="edit"
                                  coupon={c}
                                  onSave={loadCoupons}
                                  trigger={
                                    <div className="flex items-center gap-2 w-full text-xs text-slate-700">
                                      <Edit className="w-3.5 h-3.5" /> Editar Cupón
                                    </div>
                                  }
                                />
                              </div>
                              <DropdownMenuItem 
                                className="text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700 flex items-center gap-2 text-xs"
                                onClick={() => setDeleteCode(c.code)}
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Confirmar Eliminación */}
      <AlertDialog open={!!deleteCode} onOpenChange={(open) => !open && setDeleteCode(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará de forma permanente el cupón <strong className="text-slate-900">{deleteCode}</strong>.
              Los clientes ya no podrán usar este código de descuento en el checkout.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCoupon}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'Eliminando...' : 'Eliminar Permanentemente'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
