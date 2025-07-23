"use client";

import { useState, useEffect, useMemo } from 'react';
import ProductCard from '@/components/shop/product-card';
import { getProducts, getColors } from '@/lib/api';
import { Product } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const allCategories = ['all', 'cadenas', 'dijes', 'pulseras', 'aros'];

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeColor, setActiveColor] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [fetchedProducts, fetchedColors] = await Promise.all([
          getProducts(),
          getColors(),
        ]);
        setProducts(fetchedProducts);
        setColors(['all', ...fetchedColors]);
      } catch (err) {
        setError('Failed to fetch data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => activeCategory === 'all' || p.category === activeCategory)
      .filter(p => activeColor === 'all' || p.color === activeColor);
  }, [products, activeCategory, activeColor]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36 text-center">
        <h2 className="text-2xl font-semibold">Cargando productos...</h2>
        <p className="mt-2 text-muted-foreground">Por favor, espera.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36 text-center">
        <h2 className="text-2xl font-semibold text-red-500">Error al cargar productos</h2>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <p className="mt-2 text-muted-foreground">Por favor, intenta de nuevo más tarde.</p>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold">Nuestra Colección</h1>
          <p className="mt-4 text-lg text-muted-foreground">Define tu flow con cada pieza.</p>
        </div>

        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveCategory}>
          <TabsList className="grid w-full grid-cols-5 mb-4">
            {allCategories.map((category) => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category === 'all' ? 'Todos' : category}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex justify-end items-center mb-8">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Color:</span>
              <Select onValueChange={setActiveColor} value={activeColor}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por color" />
                </SelectTrigger>
                <SelectContent>
                    {colors.map(color => (
                      <SelectItem key={color} value={color}>
                      {color === 'all' ? 'Todos' : color}
                    </SelectItem>
                    ))}
                  </SelectContent>
              </Select>
            </div>
          </div>
          
          <Separator className="mb-12" />

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold">No se encontraron productos</h2>
              <p className="mt-2 text-muted-foreground">Prueba a cambiar los filtros.</p>
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );
}
