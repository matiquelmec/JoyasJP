'use client'

import { useCallback, useMemo, useState } from 'react'
import LazyProductCard from '@/components/shop/lazy-product-card'
import { useMemoizedProducts } from '@/hooks/use-memoized-products'
import { ColorFilter } from '@/components/shop/color-filter'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Product } from '@/lib/types'
import { productConfig } from '@/lib/config'

interface ShopClientProps {
    initialProducts: Product[]
    initialColors: string[]
}

const allCategories = ['all', ...productConfig.categories.map(c => c.id)]

export function ShopClient({ initialProducts, initialColors }: ShopClientProps) {
    const [activeCategory, setActiveCategory] = useState('all')
    const [activeColor, setActiveColor] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    // Optimización: Callback memoizado para el cambio de color
    const handleColorChange = useCallback((value: string) => {
        setActiveColor(value);
    }, []);

    // ⚡ MEMOIZACIÓN: Filtros de productos optimizados con hook personalizado
    const baseFilteredProducts = useMemoizedProducts({
        products: initialProducts,
        category: activeCategory,
        color: activeColor,
        searchTerm: searchQuery
    })

    // Ordenamiento memoizado por categoría
    const filteredProducts = useMemo(() => {
        const categoryOrder = productConfig.categories.map(c => c.id);

        if (activeCategory === 'all') {
            return [...baseFilteredProducts].sort((a, b) => {
                const indexA = categoryOrder.indexOf(a.category as any);
                const indexB = categoryOrder.indexOf(b.category as any);
                const finalIndexA = indexA === -1 ? 999 : indexA;
                const finalIndexB = indexB === -1 ? 999 : indexB;
                return finalIndexA - finalIndexB;
            })
        }

        return baseFilteredProducts;
    }, [baseFilteredProducts, activeCategory])

    return (
        <div className="bg-background min-h-screen overflow-x-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36">
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-bold">Nuestra Colección</h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Define tu flow con cada pieza
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
                            colors={initialColors}
                            activeColor={activeColor}
                            onColorChange={handleColorChange}
                            className="w-full md:w-auto"
                        />
                    </div>

                    <Separator className="mb-12" />

                    {filteredProducts.length > 0 ? (
                        <div className="product-grid responsive-container responsive-grid gap-8">
                            {filteredProducts.map((product, index) => (
                                <LazyProductCard
                                    key={product.id}
                                    product={product}
                                    priority={index < 6}
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
