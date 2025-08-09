'use client'

import { useEffect, useMemo, useState } from 'react'
import ProductCard from '@/components/shop/product-card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { SkeletonGrid } from '@/components/ui/skeleton-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getColors, getProducts } from '@/lib/api'
import type { Product } from '@/lib/types'

const allCategories = ['all', 'cadenas', 'dijes', 'pulseras', 'aros']

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeColor, setActiveColor] = useState('all')
  const [products, setProducts] = useState<Product[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        const [fetchedProducts, fetchedColors] = await Promise.all([
          getProducts(),
          getColors(),
        ])
        
        // Los productos ya vienen filtrados desde getProducts() (stock > 0)
        const validProducts = fetchedProducts.filter(product => 
          product.name && 
          product.name.toLowerCase() !== 'prueba' &&
          product.price > 0 &&
          !product.is_deleted
        );
        
        setProducts(validProducts)
        
        // Los colores ya vienen limpios desde getColors(), solo ordenar
        const colorOrder = ['dorado', 'plateado', 'mixto', 'negro'];
        const orderedColors = fetchedColors.sort((a, b) => {
          const indexA = colorOrder.indexOf(a.toLowerCase());
          const indexB = colorOrder.indexOf(b.toLowerCase());
          const finalIndexA = indexA === -1 ? 999 : indexA;
          const finalIndexB = indexB === -1 ? 999 : indexB;
          return finalIndexA - finalIndexB;
        });
        
        setColors(['all', ...orderedColors])
      } catch (err) {
        setError('Failed to fetch data.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchInitialData()
  }, [])

  const filteredProducts = useMemo(() => {
    const categoryOrder = ['cadenas', 'dijes', 'pulseras', 'aros'];
    
    return products
      .filter((p) => {
        // Filtro por categoría
        const categoryMatch = activeCategory === 'all' || p.category === activeCategory;
        
        // Filtro por color mejorado
        const colorMatch = activeColor === 'all' || 
          (p.color && p.color.toLowerCase() === activeColor.toLowerCase());
        
        return categoryMatch && colorMatch;
      })
      .sort((a, b) => {
        // Solo ordenar por categoría cuando se muestra "Todos"
        if (activeCategory === 'all') {
          const indexA = categoryOrder.indexOf(a.category);
          const indexB = categoryOrder.indexOf(b.category);
          // Si no encuentra la categoría, la pone al final
          const finalIndexA = indexA === -1 ? 999 : indexA;
          const finalIndexB = indexB === -1 ? 999 : indexB;
          return finalIndexA - finalIndexB;
        }
        return 0; // No ordenar si está filtrado por categoría específica
      })
  }, [products, activeCategory, activeColor])

  if (loading) {
    return (
      <div className="bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold">Nuestra Colección</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Define tu flow con cada pieza.
            </p>
          </div>
          
          {/* Premium Loading skeleton */}
          <div className="mb-8">
            <div className="grid grid-cols-5 gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-zinc-800 rounded-md animate-pulse" />
              ))}
            </div>
            <div className="flex justify-end mb-8">
              <div className="w-48 h-10 bg-zinc-800 rounded-md animate-pulse" />
            </div>
          </div>
          
          <Separator className="mb-12" />
          
          <SkeletonGrid count={8} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36 text-center">
        <h2 className="text-2xl font-semibold text-red-500">
          Error al cargar productos
        </h2>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <p className="mt-2 text-muted-foreground">
          Por favor, intenta de nuevo más tarde.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold">Nuestra Colección</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Define tu flow con cada pieza.
          </p>
        </div>

        <Tabs
          defaultValue="all"
          className="w-full"
          onValueChange={setActiveCategory}
        >
          <TabsList className="grid w-full grid-cols-5 mb-4">
            {allCategories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="capitalize"
              >
                {category === 'all' ? 'Todos' : category}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex justify-end items-center mb-8">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Color:
              </span>
              <Select onValueChange={setActiveColor} value={activeColor}>
                <SelectTrigger className="w-[180px] bg-gradient-to-r from-primary/20 to-primary/30 border-primary/50 text-foreground hover:from-primary/30 hover:to-primary/40 hover:border-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] font-medium">
                  <SelectValue placeholder="Filtrar por color" />
                </SelectTrigger>
                <SelectContent 
                  className="z-[9999] bg-background border-border shadow-xl"
                  position="popper" 
                  side="bottom" 
                  align="end"
                  sideOffset={5}
                >
                  {colors.map((color) => (
                    <SelectItem 
                      key={color} 
                      value={color}
                      className="capitalize"
                    >
                      {color === 'all' ? 'Todos' : color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="mb-12" />

          {filteredProducts.length > 0 ? (
            <div className="product-grid responsive-container responsive-grid gap-8">
              {filteredProducts.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  priority={index < 4}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold">
                No se encontraron productos
              </h2>
              <p className="mt-2 text-muted-foreground">
                Prueba a cambiar los filtros.
              </p>
            </div>
          )}
        </Tabs>
      </div>
    </div>
  )
}
