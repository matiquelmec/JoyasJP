'use client'

import { useEffect, useState } from 'react'
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
  Eye,
  MoreHorizontal,
  Package,
  Search,
  Trash2,
  Plus,
  Undo2,
  Clock,
} from 'lucide-react'
import { supabase } from '@/lib/supabase-client'
import type { Product } from '@/lib/types'
import { ProductFormModal } from './product-form-modal'
import { ProductDetailsModal } from './product-details-modal'
import { toast } from '@/hooks/use-toast'

// Tipo para los datos que vienen de Supabase
interface SupabaseProduct {
  [key: string]: any
  image_url?: string
  imageUrl?: string
}

export function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
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
      }, 10000) // 10 seconds to undo

      return () => clearTimeout(timer)
    }
  }, [recentlyDeleted])

  const loadProducts = async () => {
    try {
      if (!supabase) return

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false })

      if (error) {
        console.error('Error loading products:', error)
        return
      }

      // Mapear los datos de Supabase al formato esperado
      const mappedProducts = (data || []).map((product: SupabaseProduct) => ({
        ...product,
        imageUrl: product.image_url || product.imageUrl, // Mapear image_url a imageUrl
      })) as Product[]
      setProducts(mappedProducts)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStock = async (productId: string, newStock: number) => {
    try {
      if (!supabase) return

      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId)

      if (error) {
        console.error('Error updating stock:', error)
        return
      }

      // Actualizar el estado local
      setProducts(prev => 
        prev.map(p => 
          p.id === productId ? { ...p, stock: newStock } : p
        )
      )
    } catch (error) {
      console.error('Error updating stock:', error)
    }
  }

  const handleDeleteProduct = async () => {
    if (!deleteProduct || !supabase) return

    setDeleting(true)
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deleteProduct.id)

      if (error) throw error

      // Store the deleted product for potential undo
      setRecentlyDeleted({
        product: deleteProduct,
        timestamp: Date.now()
      })

      // Remove from UI
      setProducts(prev => prev.filter(p => p.id !== deleteProduct.id))
      
      // Show success toast
      toast({
        title: 'Producto eliminado',
        description: `${deleteProduct.name} ha sido eliminado. Puedes restaurarlo desde el banner naranja que aparece arriba.`,
        duration: 5000,
      })
    } catch (error) {
      console.error('Error deleting product:', error)
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el producto. Intenta nuevamente.',
        variant: 'destructive'
      })
    } finally {
      setDeleting(false)
      setDeleteProduct(null)
    }
  }

  const handleUndoDelete = async () => {
    if (!recentlyDeleted || !supabase) return

    try {
      // Re-insert the product into the database with only the fields that exist in the table
      const productData = {
        id: recentlyDeleted.product.id,
        name: recentlyDeleted.product.name,
        price: recentlyDeleted.product.price,
        category: recentlyDeleted.product.category,
        stock: recentlyDeleted.product.stock || 0,
        description: recentlyDeleted.product.description || null,
        image_url: recentlyDeleted.product.imageUrl || null,
        materials: recentlyDeleted.product.materials || null,
        dimensions: recentlyDeleted.product.dimensions || null,
        color: recentlyDeleted.product.color || null,
        detail: recentlyDeleted.product.detail || null,
      }

      const { error } = await supabase
        .from('products')
        .insert([productData])

      if (error) throw error

      // Add back to UI
      setProducts(prev => [...prev, recentlyDeleted.product])
      
      // Clear the recently deleted state
      setRecentlyDeleted(null)

      toast({
        title: 'Producto restaurado',
        description: `${recentlyDeleted.product.name} ha sido restaurado exitosamente.`,
      })
    } catch (error) {
      console.error('Error restoring product:', error)
      toast({
        title: 'Error',
        description: 'No se pudo restaurar el producto. Es posible que ya no se pueda recuperar.',
        variant: 'destructive'
      })
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(products.map(p => p.category)))
  const lowStockProducts = products.filter(p => p.stock <= 5)

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Agotado</Badge>
    } else if (stock <= 5) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Stock Bajo</Badge>
    } else if (stock <= 10) {
      return <Badge variant="outline">Stock Medio</Badge>
    } else {
      return <Badge variant="default" className="bg-green-100 text-green-800">En Stock</Badge>
    }
  }

  if (loading) {
    return <div>Cargando productos...</div>
  }

  return (
    <div className="space-y-6">
      {/* Banner de producto eliminado recientemente */}
      {recentlyDeleted && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800 dark:text-orange-200">
                    Producto eliminado recientemente
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    "{recentlyDeleted.product.name}" - Puedes restaurarlo antes de que expire
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUndoDelete}
                  className="border-orange-300 text-orange-800 hover:bg-orange-100"
                >
                  <Undo2 className="w-4 h-4 mr-2" />
                  Restaurar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setRecentlyDeleted(null)}
                  className="text-orange-600 hover:bg-orange-100"
                >
                  Descartar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas rápidas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Productos</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Stock Bajo</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm font-medium">Valor Total Inventario</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCLP(products.reduce((total, p) => total + (p.price * p.stock), 0))}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm font-medium">Productos Agotados</p>
              <p className="text-2xl font-bold text-red-600">
                {products.filter(p => p.stock === 0).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrar Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de productos */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Productos ({filteredProducts.length})
            </CardTitle>
            <ProductFormModal
              mode="create"
              onSave={loadProducts}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.imageUrl || '/assets/logo.png'}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: {product.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCLP(product.price)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={product.stock}
                          onChange={(e) => {
                            const newStock = parseInt(e.target.value) || 0
                            updateStock(product.id, newStock)
                          }}
                          className="w-20"
                          min="0"
                        />
                        <span className="text-sm text-muted-foreground">unidades</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStockBadge(product.stock)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCLP(product.price * product.stock)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <ProductDetailsModal
                            product={product}
                            onSave={loadProducts}
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalles
                              </DropdownMenuItem>
                            }
                          />
                          <ProductFormModal
                            mode="edit"
                            product={product}
                            onSave={loadProducts}
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar rápido
                              </DropdownMenuItem>
                            }
                          />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => setDeleteProduct(product)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
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

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto "{deleteProduct?.name}" será eliminado permanentemente de la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}