'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
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
  AlertTriangle,
  AlertCircle,
  Edit,
  MoreHorizontal,
  Package,
  Trash2,
  Undo2,
  Clock,
  Plus,
  Minus,
  RefreshCw,
} from 'lucide-react'
import type { Product } from '@/lib/types'
import { adminAPI } from '@/lib/admin-api'
import { toast } from 'sonner'
import { ProductFormModal } from './product-form-modal'

function ProductsManagerSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Cargando inventario">
      <div className="grid gap-6 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={idx} className="relative overflow-hidden border-slate-200 bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-slate-200 animate-pulse" />
                <div className="h-8 w-20 rounded bg-slate-200 animate-pulse" />
              </div>
              <div className="h-12 w-12 rounded-xl bg-slate-100 animate-pulse" />
            </CardContent>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/60 to-transparent animate-shimmer pointer-events-none" />
          </Card>
        ))}
      </div>
      <Card className="border-slate-200 bg-white overflow-hidden">
        <CardHeader className="bg-slate-950 p-6">
          <div className="h-7 w-48 rounded bg-zinc-800 animate-pulse" />
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-slate-200 animate-pulse shrink-0" />
                <div className="space-y-2">
                  <div className="h-4 w-44 rounded bg-slate-200 animate-pulse" />
                  <div className="h-3 w-24 rounded bg-slate-100 animate-pulse" />
                </div>
              </div>
              <div className="h-5 w-20 rounded bg-slate-200 animate-pulse" />
              <div className="h-5 w-24 rounded bg-slate-200 animate-pulse" />
              <div className="h-8 w-28 rounded bg-slate-200 animate-pulse" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [updatingStockId, setUpdatingStockId] = useState<string | null>(null)
  const [recentlyDeleted, setRecentlyDeleted] = useState<{
    product: Product
    timestamp: number
  } | null>(null)

  const loadProducts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const data = await adminAPI.getProducts()
      const activeProducts = (data || []).filter((product: any) => !product.deleted_at)
      setProducts(activeProducts)
    } catch (err: any) {
      const message = err?.message || 'No se pudieron cargar los productos.'
      if (!silent) setError(message)
      toast.error('Error de inventario', { description: message })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    if (recentlyDeleted) {
      const timer = setTimeout(() => {
        setRecentlyDeleted(null)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [recentlyDeleted])

  const updateStock = async (productId: string, newStock: number) => {
    const validStock = Math.max(0, newStock)
    setUpdatingStockId(productId)
    try {
      await adminAPI.updateStock(productId, validStock)
      // Recalcular en vivo el stock propio y el de conjuntos que dependan de este componente
      setProducts((prev) => {
        const updatedList = prev.map((p) =>
          p.id === productId ? { ...p, stock: validStock } : p
        )
        const stockMap = new Map<string, number>()
        for (const item of updatedList) {
          stockMap.set(item.id, Number(item.stock || 0))
        }
        return updatedList.map((p) => {
          if (!p.is_bundle) return p
          const comps = (p as any).components as Array<{ product_id: string; quantity: number }> | undefined
          if (!comps || comps.length === 0) return { ...p, stock: 0 }
          const maxBundles = comps.map((c) =>
            Math.floor((stockMap.get(String(c.product_id)) || 0) / Math.max(1, Number(c.quantity || 1)))
          )
          return { ...p, stock: Math.min(...maxBundles) }
        })
      })
      toast.success('Stock actualizado', {
        description: `Nuevo stock asignado: ${validStock} unidades`,
      })
    } catch {
      toast.error('Error', {
        description: 'No se pudo actualizar el stock en la base de datos.',
      })
    } finally {
      setUpdatingStockId(null)
    }
  }

  const handleDeleteProduct = async () => {
    if (!deleteProduct) return
    setDeleting(true)
    try {
      await adminAPI.deleteProduct(deleteProduct.id)
      setRecentlyDeleted({ product: deleteProduct, timestamp: Date.now() })
      setProducts((prev) => prev.filter((p) => p.id !== deleteProduct.id))
      toast.success('Producto eliminado', {
        description: `${deleteProduct.name} ha sido eliminado.`,
      })
    } catch {
      toast.error('Error', {
        description: 'No se pudo eliminar el producto.',
      })
    } finally {
      setDeleting(false)
      setDeleteProduct(null)
    }
  }

  const handleUndoDelete = async () => {
    if (!recentlyDeleted) return
    try {
      await adminAPI.restoreProduct(recentlyDeleted.product.id)
      await loadProducts(true)
      setRecentlyDeleted(null)
      toast.success('Producto restaurado', {
        description: `${recentlyDeleted.product.name} ha sido restaurado.`,
      })
    } catch {
      toast.error('Error', { description: 'No se pudo restaurar.' })
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory
    const matchesSearch =
      searchTerm === '' ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesCategory && matchesSearch
  })

  const categories = Array.from(new Set(products.map((p) => p.category)))
  const lowStockProducts = products.filter((p) => !p.is_bundle && p.stock === 1)

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant={'destructive' as any}>Agotado</Badge>
    } else if (stock === 1) {
      return (
        <Badge variant={'secondary' as any} className="bg-orange-500 text-white border-none">
          Última Unidad
        </Badge>
      )
    } else {
      return (
        <Badge variant={'default' as any} className="bg-green-600 text-white border-none">
          En Stock
        </Badge>
      )
    }
  }

  if (loading) {
    return <ProductsManagerSkeleton />
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50/70 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-red-950 uppercase tracking-tight mb-2">
            No se pudo sincronizar el inventario maestro
          </h3>
          <p className="text-sm text-red-800 max-w-md mb-6 font-medium">{error}</p>
          <Button
            onClick={() => loadProducts()}
            className="min-h-[44px] bg-red-600 hover:bg-red-700 text-white font-bold gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar carga
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black font-headline uppercase tracking-tighter text-slate-900">
            Inventario Maestro
          </h1>
          <p className="text-slate-600 font-medium">Gestión total de piezas, stock y precios.</p>
        </div>
        <ProductFormModal mode="create" onSave={() => loadProducts(true)} />
      </div>

      {recentlyDeleted && (
        <Card className="border-orange-500/50 bg-orange-500/10 backdrop-blur-sm shadow-lg animate-in slide-in-from-top-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-600" />
                <p className="text-sm font-medium">
                  &ldquo;{recentlyDeleted.product.name}&rdquo; eliminado.{' '}
                  <span className="hidden sm:inline">¿Fue un error?</span>
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size={'sm' as any}
                  variant={'outline' as any}
                  onClick={handleUndoDelete}
                  className="bg-white hover:bg-orange-50 border-orange-200 text-orange-700"
                >
                  <Undo2 className="w-4 h-4 mr-1" /> Deshacer
                </Button>
                <Button
                  size={'sm' as any}
                  variant={'ghost' as any}
                  onClick={() => setRecentlyDeleted(null)}
                  className="text-orange-600"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-4">
        {[
          {
            label: 'Productos',
            value: products.length,
            icon: Package,
            color: 'text-slate-600',
            bg: 'bg-slate-100',
          },
          {
            label: 'Stock Bajo',
            value: lowStockProducts.length,
            icon: AlertTriangle,
            color: 'text-amber-600',
            bg: 'bg-amber-100',
          },
          {
            label: 'Valor Total',
            value: formatCLP(
              products
                .filter((p) => !p.is_bundle)
                .reduce((t, p) => t + p.price * (p.stock || 0), 0)
            ),
            icon: DollarSign,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100',
          },
          {
            label: 'Agotados',
            value: products.filter((p) => (p.stock || 0) === 0).length,
            icon: Package,
            color: 'text-rose-600',
            bg: 'bg-rose-100',
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white"
          >
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                  {stat.label}
                </p>
                <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200 shadow-xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-950 text-white p-6 border-b border-slate-900">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <CardTitle className="text-xl font-black uppercase tracking-widest">
              Joyas en Catálogo
            </CardTitle>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Input
                placeholder="Buscar por nombre o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white text-xs h-9 w-full sm:w-64 placeholder:text-zinc-500 focus-visible:ring-primary"
              />

              <span className="text-xs font-bold uppercase tracking-widest opacity-60 ml-2">
                Filtrar:
              </span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white text-xs p-2 rounded-md focus:ring-1 focus:ring-primary h-9"
              >
                <option value="all">TODAS LAS CATEGORÍAS</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-100 border-b border-slate-200">
                <TableRow className="hover:bg-slate-100">
                  <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4 pl-6 text-slate-700">
                    Producto
                  </TableHead>
                  <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4 text-slate-700">
                    Categoría
                  </TableHead>
                  <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4 text-slate-700">
                    Precio
                  </TableHead>
                  <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4 text-slate-700">
                    Stock
                  </TableHead>
                  <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4 text-slate-700 text-right pr-6">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <Package className="w-8 h-8 text-slate-400" />
                        <p className="text-sm font-bold text-slate-700">
                          No se encontraron joyas para la búsqueda actual.
                        </p>
                        {(searchTerm || filterCategory !== 'all') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSearchTerm('')
                              setFilterCategory('all')
                            }}
                          >
                            Limpiar filtros
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((p) => {
                    const bundleComponents = ((p as any).components || []) as Array<{
                      product_id: string
                      quantity: number
                    }>
                    const currentStock = Number(p.stock || 0)

                    return (
                      <TableRow
                        key={p.id}
                        className="hover:bg-slate-50 transition-colors border-slate-100 group"
                      >
                        <TableCell className="py-4 pl-6">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden relative shadow-inner">
                              <Image
                                src={p.imageUrl || '/assets/logo.webp'}
                                alt={p.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-bold text-sm text-zinc-900 leading-tight mb-1 flex items-center gap-2">
                                {p.name}
                                {p.is_priority && (
                                  <span className="text-amber-500" title="Prioritario">
                                    ⭐
                                  </span>
                                )}
                                {p.is_bundle && (
                                  <Badge className="bg-amber-500 hover:bg-amber-600 text-white h-4 text-[8px] px-1 border-none font-black">
                                    CONJUNTO
                                  </Badge>
                                )}
                                {p.discount_price && (
                                  <Badge variant="destructive" className="h-4 text-[8px] px-1">
                                    OFERTA
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[10px] font-mono text-zinc-400 flex items-center gap-2">
                                ID: {p.id.slice(0, 8)}
                                {p.custom_label && (
                                  <span className="text-indigo-500 font-bold uppercase">
                                    [{p.custom_label}]
                                  </span>
                                )}
                              </p>
                              {p.is_bundle &&
                                (bundleComponents.length > 0 ? (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {bundleComponents.map((comp, idx) => {
                                      const matched = products.find(
                                        (prod) => prod.id === comp.product_id
                                      )
                                      return (
                                        <span
                                          key={idx}
                                          className="inline-flex items-center text-[9px] bg-amber-50 text-amber-800 border border-amber-200 rounded px-1 py-0.5 font-bold"
                                        >
                                          {comp.quantity}x {matched?.name || comp.product_id}
                                        </span>
                                      )
                                    })}
                                  </div>
                                ) : (
                                  <p className="text-[10px] text-red-600 font-bold mt-1">
                                    ⚠️ Sin componentes asociados (edita para vincular piezas)
                                  </p>
                                ))}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={'outline' as any}
                            className="bg-slate-100 text-slate-800 border-slate-300 text-[10px] uppercase font-bold tracking-widest"
                          >
                            {p.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-black text-sm text-zinc-900">
                          {p.discount_price ? (
                            <div className="flex flex-col">
                              <span className="text-red-600">{formatCLP(p.discount_price)}</span>
                              <span className="text-[10px] text-zinc-400 line-through">
                                {formatCLP(p.price)}
                              </span>
                            </div>
                          ) : (
                            formatCLP(p.price)
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {p.is_bundle ? (
                              <div className="flex items-center gap-2">
                                <span
                                  className="h-8 px-2.5 flex items-center justify-center text-xs font-black bg-amber-50 text-amber-900 border border-amber-300 rounded-md shadow-inner"
                                  title="Stock calculado dinámicamente según componentes"
                                >
                                  {currentStock}
                                </span>
                                <span className="text-[10px] text-amber-700 font-bold uppercase tracking-tighter">
                                  Auto
                                </span>
                              </div>
                            ) : (
                              <StockEditor
                                productId={p.id}
                                initialStock={currentStock}
                                onUpdate={updateStock}
                                disabled={updatingStockId === p.id}
                              />
                            )}
                            {getStockBadge(currentStock)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant={'outline' as any}
                                size={'icon' as any}
                                className="h-9 w-9 border-slate-300 bg-white hover:bg-slate-50 shadow-sm"
                              >
                                <MoreHorizontal className="h-4 w-4 text-slate-700" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 p-2">
                              <ProductFormModal
                                mode="edit"
                                product={p}
                                onSave={() => loadProducts(true)}
                                trigger={
                                  <div className="flex items-center px-2 py-2 text-xs font-medium cursor-pointer hover:bg-zinc-100 rounded-md">
                                    <Edit className="mr-2 h-4 w-4 text-zinc-500" />
                                    Gestionar Detalles
                                  </div>
                                }
                              />
                              <div
                                className="flex items-center px-2 py-2 text-xs font-medium cursor-pointer hover:bg-red-50 text-red-600 rounded-md mt-1"
                                onClick={() => setDeleteProduct(p)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar Producto
                              </div>
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

      <AlertDialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black uppercase tracking-tighter">
              ¿Confirmar Eliminación?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-600">
              Estás a punto de eliminar <strong>&ldquo;{deleteProduct?.name}&rdquo;</strong>. Esta
              acción se puede revertir temporalmente, pero el producto dejará de estar visible para
              los clientes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="font-bold border-zinc-300">CANCELAR</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
              disabled={deleting}
            >
              {deleting ? 'ELIMINANDO...' : 'SÍ, ELIMINAR'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function StockEditor({
  productId,
  initialStock,
  onUpdate,
  disabled,
}: {
  productId: string
  initialStock: number
  onUpdate: (id: string, stock: number) => Promise<void>
  disabled?: boolean
}) {
  const [val, setVal] = useState(String(initialStock))

  useEffect(() => {
    setVal(String(initialStock))
  }, [initialStock])

  const commitValue = (targetVal: number) => {
    const clean = Math.max(0, targetVal)
    if (clean !== initialStock) {
      onUpdate(productId, clean)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="h-8 w-8 border-slate-300 bg-white"
        disabled={disabled || initialStock <= 0}
        onClick={() => commitValue(initialStock - 1)}
      >
        <Minus className="h-3 w-3" />
      </Button>

      <Input
        type="number"
        value={val}
        disabled={disabled}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.currentTarget.blur()
          }
        }}
        onBlur={() => {
          const parsed = parseInt(val, 10)
          if (isNaN(parsed)) {
            setVal(String(initialStock))
          } else {
            commitValue(parsed)
          }
        }}
        className="h-8 w-14 text-center text-xs font-bold border-zinc-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />

      <Button
        type="button"
        size="icon"
        variant="outline"
        className="h-8 w-8 border-slate-300 bg-white"
        disabled={disabled}
        onClick={() => commitValue(initialStock + 1)}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  )
}

const DollarSign = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="12" x2="12" y1="2" y2="22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)
