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
const PRODUCTS_PER_PAGE = 12

export function ShopClient({ initialProducts, initialColors }: ShopClientProps) {
    const [activeCategory, setActiveCategory] = useState('all')
    const [activeColor, setActiveColor] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE)

    // Optimización: Callback memoizado para el cambio de color
    const handleColorChange = useCallback((value: string) => {
        setActiveColor(value);
    }, []);

    // Resetear paginación al cambiar de categoría
    const handleCategoryChange = useCallback((value: string) => {
        setActiveCategory(value)
        setVisibleCount(PRODUCTS_PER_PAGE)
    }, [])

    // ⚡ MEMOIZACIÓN: Filtros de productos optimizados con hook personalizado
    const baseFilteredProducts = useMemoizedProducts({
        products: initialProducts,
        category: activeCategory,
        color: activeColor,
        searchTerm: searchQuery
    })

    // ⚡ ESTRATEGIA: Agrupación de variantes (mismo nombre y color)
    const groupedProducts = useMemo(() => {
        const groups: Record<string, Product & { hasVariants: boolean, minPrice: number }> = {};

        baseFilteredProducts.forEach(product => {
            const key = `${product.name.toLowerCase()}-${(product.color || '').toLowerCase()}`;
            const effectivePrice = product.discount_price || product.price;

            if (!groups[key]) {
                groups[key] = {
                    ...product,
                    hasVariants: false,
                    minPrice: effectivePrice
                };
            } else {
                groups[key].hasVariants = true;
                if (effectivePrice < groups[key].minPrice) {
                    // Actualizamos el producto base para que sea el que tiene el precio más bajo
                    const hasVariants = groups[key].hasVariants;
                    groups[key] = {
                        ...product,
                        hasVariants,
                        minPrice: effectivePrice
                    };
                }
            }
        });

        return Object.values(groups);
    }, [baseFilteredProducts]);

    // Ordenamiento memoizado por categoría (aplicado a los productos agrupados)
    const filteredProducts = useMemo(() => {
        const categoryOrder = productConfig.categories.map(c => c.id);

        if (activeCategory === 'all') {
            return [...groupedProducts].sort((a, b) => {
                const indexA = categoryOrder.indexOf(a.category as typeof productConfig.categories[number]['id']);
                const indexB = categoryOrder.indexOf(b.category as typeof productConfig.categories[number]['id']);
                const finalIndexA = indexA === -1 ? 999 : indexA;
                const finalIndexB = indexB === -1 ? 999 : indexB;
                return finalIndexA - finalIndexB;
            })
        }

        return groupedProducts;
    }, [groupedProducts, activeCategory]);

    // Productos visibles (paginación)
    const visibleProducts = useMemo(() => filteredProducts.slice(0, visibleCount), [filteredProducts, visibleCount])
    const hasMore = visibleCount < filteredProducts.length
    const remaining = filteredProducts.length - visibleCount

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
                    onValueChange={handleCategoryChange}
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
                                placeholder="Buscar joyas"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value)
                                    setVisibleCount(PRODUCTS_PER_PAGE)
                                }}
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

                    {/* Contador de resultados */}
                    <p className="text-sm text-muted-foreground mb-6">
                        Mostrando <span className="text-foreground font-semibold">{Math.min(visibleCount, filteredProducts.length)}</span> de{' '}
                        <span className="text-foreground font-semibold">{filteredProducts.length}</span> productos
                    </p>

                    {filteredProducts.length > 0 ? (
                        <>
                            <div className="product-grid responsive-container responsive-grid gap-8">
                                {visibleProducts.map((product, index) => (
                                    <LazyProductCard
                                        key={product.id}
                                        product={product}
                                        priority={index < 6}
                                    />
                                ))}
                            </div>

                            {/* Botón Cargar Más */}
                            {hasMore && (
                                <div className="flex flex-col items-center mt-14 gap-3">
                                    <button
                                        onClick={() => setVisibleCount(prev => prev + PRODUCTS_PER_PAGE)}
                                        className="group relative inline-flex items-center gap-3 px-10 py-4 bg-transparent border border-primary/50 text-primary font-semibold rounded-full transition-all duration-300 hover:bg-primary hover:text-black hover:border-primary hover:scale-105 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]"
                                    >
                                        <span>Cargar más</span>
                                        <span className="text-xs opacity-70">({remaining} restantes)</span>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="transition-transform duration-300 group-hover:translate-y-1"
                                        >
                                            <path d="M12 5v14M5 12l7 7 7-7" />
                                        </svg>
                                    </button>
                                    <p className="text-xs text-muted-foreground">
                                        {filteredProducts.length} productos en total
                                    </p>
                                </div>
                            )}
                        </>
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
