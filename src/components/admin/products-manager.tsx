'use client'

import { useEffect, useState } from 'react'
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
  AlertTriangle,
  Edit,
  MoreHorizontal,
  Package,
  Trash2,
  Undo2,
  Clock,
} from 'lucide-react'
import type { Product } from '@/lib/types'
import { adminAPI } from '@/lib/admin-api'
import { toast } from 'sonner'
import { ProductFormModal } from './product-form-modal'

// Tipo para los datos que vienen de Supabase
interface SupabaseProduct {
  [key: string]: any
  imageUrl?: string
}

export function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [recentlyDeleted, setRecentlyDeleted] = useState<{
    product: Product
    timestamp: number
  } | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  // Auto-clear recently deleted after 10 seconds
  useEffect(() => {
    if (recentlyDeleted) {
      const timer = setTimeout(() => {
        setRecentlyDeleted(null)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [recentlyDeleted])

  const loadProducts = async () => {
    try {
      const data = await adminAPI.getProducts()
      const activeProducts = data.filter((product: any) => !product.deleted_at)
      const mappedProducts = activeProducts.map((product: SupabaseProduct) => ({
        ...product,
        imageUrl: product.imageUrl,
      })) as Product[]
      setProducts(mappedProducts)
    } catch (error) {
      toast.error('Error', {
        description: 'No se pudieron cargar los productos.',
      })
    } finally {
      setLoading(false)
    }
  }

  const updateStock = async (productId: string, newStock: number) => {
    try {
      await adminAPI.updateStock(productId, newStock)
      setProducts(prev =>
        prev.map(p => p.id === productId ? { ...p, stock: newStock } : p)
      )
    } catch (error) {
      toast.error('Error', {
        description: 'No se pudo actualizar el stock.',
      })
    }
  }

  const handleDeleteProduct = async () => {
    if (!deleteProduct) return
    setDeleting(true)
    try {
      await adminAPI.deleteProduct(deleteProduct.id)
      setRecentlyDeleted({ product: deleteProduct, timestamp: Date.now() })
      setProducts(prev => prev.filter(p => p.id !== deleteProduct.id))
      toast.success('Producto eliminado', {
        description: `${deleteProduct.name} ha sido eliminado.`,
      })
    } catch (error) {
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
      await adminAPI.restoreProduct(recentlyDeleted.product.id, recentlyDeleted.product.stock || 0)
      setProducts(prev => [...prev, recentlyDeleted.product])
      setRecentlyDeleted(null)
      toast.success('Producto restaurado', { description: `${recentlyDeleted.product.name} ha sido restaurado.` })
    } catch (error) {
      toast.error('Error', { description: 'No se pudo restaurar.' })
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory
    const matchesSearch = searchTerm === '' ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesCategory && matchesSearch
  })

  const categories = Array.from(new Set(products.map(p => p.category)))
  const lowStockProducts = products.filter(p => p.stock === 1)

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant={"destructive" as any}>Agotado</Badge>
    } else if (stock === 1) {
      return <Badge variant={"secondary" as any} className="bg-orange-500 text-white border-none">Última Unidad</Badge>
    } else {
      return <Badge variant={"default" as any} className="bg-green-600 text-white border-none">En Stock</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-pulse text-muted-foreground uppercase tracking-widest font-black">Cargando Inventario...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black font-headline uppercase tracking-tighter text-slate-900">Inventario Maestro</h1>
          <p className="text-slate-600 font-medium">Gestión total de piezas, stock y precios.</p>
        </div>
        <ProductFormModal mode="create" onSave={loadProducts} />
      </div>

      {recentlyDeleted && (
        <Card className="border-orange-500/50 bg-orange-500/10 backdrop-blur-sm shadow-lg animate-in slide-in-from-top-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-600" />
                <p className="text-sm font-medium">
                  "{recentlyDeleted.product.name}" eliminado. <span className="hidden sm:inline">¿Fue un error?</span>
                </p>
              </div>
              <div className="flex gap-2">
                <Button size={"sm" as any} variant={"outline" as any} onClick={handleUndoDelete} className="bg-white hover:bg-orange-50 border-orange-200 text-orange-700">
                  <Undo2 className="w-4 h-4 mr-1" /> Deshacer
                </Button>
                <Button size={"sm" as any} variant={"ghost" as any} onClick={() => setRecentlyDeleted(null)} className="text-orange-600">
                  Cerrar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: 'Productos', value: products.length, icon: Package, color: 'text-slate-600', bg: 'bg-slate-100' },
          { label: 'Stock Bajo', value: lowStockProducts.length, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Valor Total', value: formatCLP(products.reduce((t, p) => t + (p.price * p.stock), 0)), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Agotados', value: products.filter(p => p.stock === 0).length, icon: Package, color: 'text-rose-600', bg: 'bg-rose-100' }
        ].map((stat, i) => (
          <Card key={i} className="border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
                <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))
        }
      </div>

      <Card className="border-slate-200 shadow-xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-950 text-white p-6 border-b border-slate-900">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <CardTitle className="text-xl font-black uppercase tracking-widest">Joyas en Catálogo</CardTitle>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search Bar */}
              <Input
                placeholder="Buscar por nombre o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white text-xs h-9 w-full sm:w-64 placeholder:text-zinc-500 focus-visible:ring-primary"
              />

              <span className="text-xs font-bold uppercase tracking-widest opacity-60 ml-2">Filtrar:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white text-xs p-2 rounded-md focus:ring-1 focus:ring-primary h-9"
              >
                <option value="all">TODAS LAS CATEGORÍAS</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c.toUpperCase()}</option>
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
                  <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4 pl-6 text-slate-700">Producto</TableHead>
                  <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4 text-slate-700">Categoría</TableHead>
                  <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4 text-slate-700">Precio</TableHead>
                  <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4 text-slate-700">Stock</TableHead>
                  <TableHead className="font-bold uppercase text-[11px] tracking-wider py-4 text-slate-700 text-right pr-6">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((p) => (
                  <TableRow key={p.id} className="hover:bg-slate-50 transition-colors border-slate-100 group">
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden relative shadow-inner">
                          <Image src={p.imageUrl || '/assets/logo.webp'} alt={p.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-zinc-900 leading-tight mb-1">{p.name}</p>
                          <p className="text-[10px] font-mono text-zinc-400">ID: {p.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={"outline" as any} className="bg-slate-100 text-slate-800 border-slate-300 text-[10px] uppercase font-bold tracking-widest">
                        {p.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-black text-sm text-zinc-900">
                      {formatCLP(p.price)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          value={p.stock}
                          onChange={(e) => updateStock(p.id, parseInt(e.target.value) || 0)}
                          className="h-8 w-16 text-center text-xs font-bold border-zinc-200"
                        />
                        {getStockBadge(p.stock)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant={"outline" as any} size={"icon" as any} className="h-8 w-8 border-slate-300 bg-white hover:bg-slate-50 shadow-sm">
                            <MoreHorizontal className="h-4 w-4 text-slate-700" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-2">
                          <ProductFormModal
                            mode="edit"
                            product={p}
                            onSave={loadProducts}
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black uppercase tracking-tighter">¿Confirmar Eliminación?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-600">
              Estás a punto de eliminar <strong>"{deleteProduct?.name}"</strong>. Esta acción se puede revertir temporalmente, pero el producto dejará de estar visible para los clientes.
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