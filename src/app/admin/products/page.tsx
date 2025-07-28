"use client";

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  RefreshCw,
  Package,
  DollarSign,
  Image as ImageIcon,
  Save
} from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  stock: number;
  category?: string;
  is_active: boolean;
  created_at: string;
}

interface ProductForm {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    image_url: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter, stockFilter]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error loading products:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los productos",
          variant: "destructive"
        });
        return;
      }

      setProducts((data || []) as unknown as Product[]);
    } catch (error) {
      logger.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por categoría
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Filtrar por stock
    if (stockFilter === 'low') {
      filtered = filtered.filter(product => product.stock < 5);
    } else if (stockFilter === 'out') {
      filtered = filtered.filter(product => product.stock === 0);
    }

    setFilteredProducts(filtered);
  };

  const getCategories = () => {
    const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
    return categories;
  };

  const openEditDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        stock: product.stock,
        category: product.category || '',
        image_url: product.image_url || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        category: '',
        image_url: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    try {
      if (!formData.name.trim()) {
        toast({
          title: "Error",
          description: "El nombre del producto es requerido",
          variant: "destructive"
        });
        return;
      }

      if (formData.price <= 0) {
        toast({
          title: "Error",
          description: "El precio debe ser mayor a 0",
          variant: "destructive"
        });
        return;
      }

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: formData.price,
        stock: formData.stock,
        category: formData.category.trim() || null,
        image_url: formData.image_url.trim() || null,
        is_active: true
      };

      if (editingProduct) {
        // Actualizar producto existente
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) {
          logger.error('Error updating product:', error);
          toast({
            title: "Error",
            description: "No se pudo actualizar el producto",
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "Producto actualizado",
          description: "Los cambios se guardaron correctamente",
          variant: "default"
        });
      } else {
        // Crear nuevo producto
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) {
          logger.error('Error creating product:', error);
          toast({
            title: "Error",
            description: "No se pudo crear el producto",
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "Producto creado",
          description: "El nuevo producto se agregó al catálogo",
          variant: "default"
        });
      }

      setIsDialogOpen(false);
      loadProducts();
    } catch (error) {
      logger.error('Error saving product:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        logger.error('Error deleting product:', error);
        toast({
          title: "Error",
          description: "No se pudo eliminar el producto",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Producto eliminado",
        description: "El producto se eliminó del catálogo",
        variant: "default"
      });

      loadProducts();
    } catch (error) {
      logger.error('Error deleting product:', error);
    }
  };

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId);

      if (error) {
        logger.error('Error updating product status:', error);
        toast({
          title: "Error",
          description: "No se pudo cambiar el estado del producto",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Estado actualizado",
        description: `Producto ${!currentStatus ? 'activado' : 'desactivado'}`,
        variant: "default"
      });

      loadProducts();
    } catch (error) {
      logger.error('Error updating product status:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Sin stock</Badge>;
    } else if (stock < 5) {
      return <Badge variant="secondary">Stock bajo</Badge>;
    } else {
      return <Badge variant="outline">En stock</Badge>;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Cargando productos...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Productos</h1>
            <p className="text-muted-foreground">
              {filteredProducts.length} de {products.length} productos
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={loadProducts} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Button onClick={() => openEditDialog()} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Producto
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              
              {/* Búsqueda */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filtro de categoría */}
              <div className="w-full lg:w-48">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {getCategories().map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro de stock */}
              <div className="w-full lg:w-48">
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Stock" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todo el stock</SelectItem>
                    <SelectItem value="low">Stock bajo</SelectItem>
                    <SelectItem value="out">Sin stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No se encontraron productos</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <Card key={product.id} className={!product.is_active ? 'opacity-60' : ''}>
                <CardContent className="p-0">
                  
                  {/* Imagen */}
                  <div className="aspect-square relative bg-gray-100 rounded-t-lg overflow-hidden">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Estado */}
                    <div className="absolute top-2 right-2">
                      {!product.is_active && (
                        <Badge variant="destructive">Inactivo</Badge>
                      )}
                    </div>
                  </div>

                  {/* Información */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                      {product.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        {formatCurrency(product.price)}
                      </span>
                      {getStockBadge(product.stock)}
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Stock: {product.stock}</span>
                      {product.category && (
                        <Badge variant="outline">{product.category}</Badge>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center justify-between pt-2">
                      <Button
                        variant={product.is_active ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleProductStatus(product.id, product.is_active)}
                      >
                        {product.is_active ? 'Desactivar' : 'Activar'}
                      </Button>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => openEditDialog(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Dialog para crear/editar producto */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nombre del producto"
                />
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descripción del producto"
                  rows={3}
                />
              </div>

              {/* Precio y Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio (CLP) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    placeholder="0"
                    min="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="Ej: Anillos, Collares, Pulseras"
                />
              </div>

              {/* URL de imagen */}
              <div className="space-y-2">
                <Label htmlFor="image_url">URL de Imagen</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveProduct}>
                  <Save className="w-4 h-4 mr-2" />
                  {editingProduct ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}