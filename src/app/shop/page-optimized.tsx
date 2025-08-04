'use client'

import { useState, useCallback, useEffect } from 'react'
import ProductCard from '@/components/shop/product-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter, Loader2 } from 'lucide-react'
import { productConfig } from '@/lib/config'
import { useProducts, useProductSearch } from '@/hooks/use-products'
import { useInView } from 'react-intersection-observer'

function ProductSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm">
      <Skeleton className="aspect-square" />
      <div className="p-4">
        <Skeleton className="h-4 mb-2" />
        <Skeleton className="h-3 w-2/3 mb-2" />
        <Skeleton className="h-5 w-1/2" />
      </div>
    </div>
  )
}

export default function ShopPageOptimized() {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [priceRange, setPriceRange] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [page, setPage] = useState(1)
  const [allProducts, setAllProducts] = useState<any[]>([])

  // Intersection observer para infinite scroll
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  })

  // Parse price range
  const { min: minPrice, max: maxPrice } = priceRange
    ? productConfig.priceRanges.find((r) => r.label === priceRange) || {}
    : {}

  // Fetch products con paginación
  const { products, pagination, isLoading } = useProducts({
    page,
    limit: 20,
    category: selectedCategory || undefined,
    minPrice,
    maxPrice: maxPrice === Infinity ? undefined : maxPrice,
    sortBy: sortBy.split('_')[0],
    sortOrder: sortBy.includes('asc') ? 'asc' : 'desc',
  })

  // Búsqueda
  const {
    search,
    setSearch,
    results: searchResults,
    isSearching,
  } = useProductSearch()

  // Acumular productos para infinite scroll
  useEffect(() => {
    if (products.length > 0) {
      if (page === 1) {
        setAllProducts(products)
      } else {
        setAllProducts((prev) => [...prev, ...products])
      }
    }
  }, [products, page])

  // Cargar más productos cuando el observador está en vista
  useEffect(() => {
    if (inView && pagination.hasMore && !isLoading && !search) {
      setPage((prev) => prev + 1)
    }
  }, [inView, pagination.hasMore, isLoading, search])

  // Reset página cuando cambian filtros
  useEffect(() => {
    setPage(1)
    setAllProducts([])
  }, [selectedCategory, priceRange, sortBy, search])

  // Productos a mostrar (búsqueda o listado normal)
  const displayProducts = search ? searchResults : allProducts
  const isLoadingProducts = search ? isSearching : isLoading && page === 1

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">
            Nuestra Colección
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explora nuestra exclusiva selección de joyas urbanas diseñadas para
            quienes se atreven a destacar
          </p>
        </div>

        {/* Filtros y búsqueda */}
        <div className="mb-8 space-y-4">
          {/* Búsqueda */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                {productConfig.categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Rango de precio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {productConfig.priceRanges.map((range) => (
                  <SelectItem key={range.label} value={range.label}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at_desc">Más recientes</SelectItem>
                <SelectItem value="price_asc">Menor precio</SelectItem>
                <SelectItem value="price_desc">Mayor precio</SelectItem>
                <SelectItem value="name_asc">Nombre A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Resultados */}
        <div className="mb-4 text-center text-sm text-muted-foreground">
          {search ? (
            <>Mostrando resultados para "{search}"</>
          ) : (
            <>
              Mostrando {displayProducts.length} de {pagination.total} productos
            </>
          )}
        </div>

        {/* Grid de productos */}
        {isLoadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              No se encontraron productos que coincidan con tu búsqueda
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearch('')
                setSelectedCategory('')
                setPriceRange('')
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Infinite scroll trigger */}
            {!search && pagination.hasMore && (
              <div ref={ref} className="flex justify-center py-8">
                {isLoading && (
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
