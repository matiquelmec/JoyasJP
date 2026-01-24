'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import LazyProductCard from '@/components/shop/lazy-product-card'
import { useMemoizedProducts } from '@/hooks/use-memoized-products'
import { ColorFilter } from '@/components/shop/color-filter'
import { Separator } from '@/components/ui/separator'
import { SkeletonGrid } from '@/components/ui/skeleton-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductService } from '@/services/product.service'
import type { Product } from '@/lib/types'

import { productConfig } from '@/lib/config'

const allCategories = ['all', ...productConfig.categories.map(c => c.id)]

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeColor, setActiveColor] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        const [fetchedProducts, fetchedColors] = await Promise.all([
          ProductService.getAllProducts(),
          ProductService.getAvailableColors(),
        ])

        // Los productos ya vienen filtrados desde getProducts() (stock > 0)
        const validProducts = fetchedProducts.filter(product =>
          product.name &&
          product.name.toLowerCase() !== 'prueba' &&
          product.price > 0
          // is_deleted field removed from Product type
        );

        setProducts(validProducts)

        // Usamos siempre los colores de la configuración central
        const allConfigColors = productConfig.colors;

        // Opcional: Si quisieras filtrar solo los que tienen productos, descomenta esto:
        // const availableColors = fetchedColors.filter(c => allConfigColors.includes(c));

        setColors(['all', ...allConfigColors])


      } catch (err) {
        setError('Failed to fetch data.')
        // console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchInitialData()
  }, [])

  // Optimización: Callback memoizado para el cambio de color
  const handleColorChange = useCallback((value: string) => {
    setActiveColor(value);
  }, []);

  // ⚡ MEMOIZACIÓN: Filtros de productos optimizados con hook personalizado
  const baseFilteredProducts = useMemoizedProducts({
    products,
    category: activeCategory,
    color: activeColor,
    searchTerm: searchQuery
  })

  // Ordenamiento memoizado por categoría
  const filteredProducts = useMemo(() => {
    // Usamos el orden de categorías de la configuración central
    const categoryOrder = productConfig.categories.map(c => c.id);

    if (activeCategory === 'all') {
      return baseFilteredProducts.sort((a, b) => {
        const indexA = categoryOrder.indexOf(a.category as any);
        const indexB = categoryOrder.indexOf(b.category as any);
        const finalIndexA = indexA === -1 ? 999 : indexA;
        const finalIndexB = indexB === -1 ? 999 : indexB;
        return finalIndexA - finalIndexB;
      })
    }

    return baseFilteredProducts;
  }, [baseFilteredProducts, activeCategory])

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
          <TabsList className="grid w-full grid-cols-5 mb-8">
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

          <div className="flex flex-col md:flex-row justify-end items-center gap-4 mb-8">
            {/* Search Input */}
            <div className="w-full md:w-auto md:min-w-[300px]">
              <input
                type="text"
                placeholder="Buscar joyas (Ej: Cadenas, Oro...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <ColorFilter
              colors={colors}
              activeColor={activeColor}
              onColorChange={handleColorChange}
              className="max-w-full"
            />
          </div>

          <Separator className="mb-12" />

          {filteredProducts.length > 0 ? (
            <div className="product-grid responsive-container responsive-grid gap-8">
              {filteredProducts.map((product, index) => (
                <LazyProductCard
                  key={product.id}
                  product={product}
                  priority={index < 6} // Los primeros 6 productos se cargan inmediatamente
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
