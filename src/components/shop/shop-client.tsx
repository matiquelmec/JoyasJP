'use client'

import { useCallback, useMemo, useState } from 'react'
import LazyProductCard from '@/components/shop/lazy-product-card'
import { useMemoizedProducts } from '@/hooks/use-memoized-products'
import { ColorFilter } from '@/components/shop/color-filter'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Product } from '@/lib/types'
import { productConfig } from '@/lib/config'
import { cn } from '@/lib/utils'

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
    const [sortBy, setSortBy] = useState('featured')

    // Optimización: Callback memoizado para el cambio de color
    const handleColorChange = useCallback((value: string) => {
        setActiveColor(value);
    }, []);

    // Resetear paginación al cambiar de categoría o de ordenamiento
    const handleCategoryChange = useCallback((value: string) => {
        setActiveCategory(value)
        setVisibleCount(PRODUCTS_PER_PAGE)
    }, [])

    const handleSortChange = useCallback((value: string) => {
        setSortBy(value)
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

    // Ordenamiento memoizado (aplicado a los productos agrupados)
    const filteredProducts = useMemo(() => {
        let result = [...groupedProducts]

        // 1. Aplicar la lógica de ordenamiento seleccionada
        if (sortBy === 'price-asc') {
            result.sort((a, b) => a.minPrice - b.minPrice)
        } else if (sortBy === 'price-desc') {
            result.sort((a, b) => b.minPrice - a.minPrice)
        } else if (sortBy === 'newest') {
            result.sort((a, b) => {
                const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
                const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
                return dateB - dateA
            })
        } else {
            // Por defecto: Orden inteligente (o por categoría si estamos en 'all')
            const categoryOrder = productConfig.categories.map(c => c.id)
            
            result.sort((a, b) => {
                // Si estamos en la categoría 'Todos', agrupamos un poco por categoría para mantener armonía visual
                if (activeCategory === 'all') {
                    const indexA = categoryOrder.indexOf(a.category as typeof productConfig.categories[number]['id'])
                    const indexB = categoryOrder.indexOf(b.category as typeof productConfig.categories[number]['id'])
                    const finalIndexA = indexA === -1 ? 999 : indexA
                    const finalIndexB = indexB === -1 ? 999 : indexB
                    if (finalIndexA !== finalIndexB) {
                        return finalIndexA - finalIndexB
                    }
                }
                
                // Si son de la misma categoría o no estamos en 'all', usamos el score inteligente
                const scoreA = (a.is_priority ? 1000000 : 0) + (a.custom_label ? 500000 : 0)
                const scoreB = (b.is_priority ? 1000000 : 0) + (b.custom_label ? 500000 : 0)
                return scoreB - scoreA
            })
        }

        return result;
    }, [groupedProducts, activeCategory, sortBy]);

    // ⚡ Filtro especial: Si la categoría es 'plata-925', filtrar por categoría O por material 'Plata Italiana 925' / 'Plata 925'
    const finalFilteredProducts = useMemo(() => {
        if (activeCategory === 'plata-925') {
            return filteredProducts.filter(p => 
                p.category === 'plata-925' || 
                (p.materials && p.materials.toLowerCase().includes('plata')) ||
                (p.custom_label && p.custom_label.toLowerCase().includes('plata'))
            )
        }
        return filteredProducts
    }, [filteredProducts, activeCategory])

    // Productos visibles (paginación)
    const visibleProducts = useMemo(() => finalFilteredProducts.slice(0, visibleCount), [finalFilteredProducts, visibleCount])
    const hasMore = visibleCount < finalFilteredProducts.length
    const remaining = finalFilteredProducts.length - visibleCount

    // Configuración narrativa dinámica por categoría
    const categoryHeader = useMemo(() => {
        switch (activeCategory) {
            case 'plata-925':
                return {
                    title: 'Plata Italiana 925',
                    subtitle: 'Ley 925 legítima importada de Italia. Brillo eterno y acabado pulido a mano.',
                    badge: '🇮🇹 EDICIÓN EXCLUSIVA MILANO'
                }
            case 'cadenas':
                return {
                    title: 'Cadenas & Cubanas',
                    subtitle: 'Eslabones diseñados para dominar la escena. Estilos Cubana, Rolo, Espiga y Snake.',
                    badge: null
                }
            case 'dijes':
                return {
                    title: 'Dijes & Colgantes',
                    subtitle: 'Detalles únicos con actitud urbana para personalizar tu cadena.',
                    badge: null
                }
            case 'pulseras':
                return {
                    title: 'Pulseras & Tuki',
                    subtitle: 'Piezas exclusivas ajustadas para acompañar tu estilo diario.',
                    badge: null
                }
            case 'conjuntos':
                return {
                    title: 'Sets & Conjuntos',
                    subtitle: 'Combinaciones perfectas de cadena y pulsera con precio preferencial.',
                    badge: '✨ DESCUENTO ESPECIAL'
                }
            default:
                return {
                    title: 'Nuestra Colección',
                    subtitle: 'Define tu flow con cada pieza. Alta joyería para la escena urbana.',
                    badge: null
                }
        }
    }, [activeCategory])

    const isSilverBg = activeCategory === 'plata-925'

    return (
        <div className={cn("min-h-screen overflow-x-hidden transition-all duration-700", isSilverBg ? "smoke-silver-bg" : "smoke-gold-bg")}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36">
                {/* Header Dinámico e Inmersivo */}
                <div className="text-center mb-12 max-w-3xl mx-auto space-y-3 animate-fadeIn">
                    {categoryHeader.badge && (
                        <div className="inline-block px-4 py-1 rounded-full bg-slate-200/10 border border-slate-300/30 text-slate-200 text-xs font-black tracking-widest uppercase mb-2 shadow-xl backdrop-blur-md animate-pulse">
                            {categoryHeader.badge}
                        </div>
                    )}
                    <h1 className={cn("text-5xl md:text-6xl font-black tracking-tight transition-all duration-500", isSilverBg ? "text-slate-100 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]" : "text-foreground")}>
                        {categoryHeader.title}
                    </h1>
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                        {categoryHeader.subtitle}
                    </p>
                </div>

                <Tabs
                    defaultValue="all"
                    className="w-full"
                    onValueChange={handleCategoryChange}
                >
                    <TabsList className="flex w-full overflow-x-auto scrollbar-none h-auto p-1.5 bg-zinc-950/90 border border-zinc-800 rounded-xl justify-start md:justify-center mb-10 gap-1.5 shadow-2xl">
                        {allCategories.map((catId) => {
                            const isVip = catId === 'plata-925'
                            const catObj = productConfig.categories.find(c => c.id === catId)
                            const label = catId === 'all' ? 'Todos' : (catObj?.name || catId)

                            return (
                                <TabsTrigger
                                    key={catId}
                                    value={catId}
                                    className={cn(
                                        "px-5 py-2.5 text-xs font-bold tracking-wider transition-all duration-300 rounded-lg flex-shrink-0 flex items-center gap-1.5",
                                        isVip 
                                            ? "data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-200 data-[state=active]:to-slate-400 data-[state=active]:text-slate-950 border border-slate-400/40 text-slate-300 shadow-[0_0_15px_rgba(226,232,240,0.2)]" 
                                            : "data-[state=active]:bg-primary data-[state=active]:text-black"
                                    )}
                                >
                                    {label}
                                </TabsTrigger>
                            )
                        })}
                    </TabsList>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 w-full">
                        {/* Selector de Ordenamiento */}
                        <div className="w-full md:w-auto">
                            <select
                                value={sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="flex h-10 w-full md:w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer font-medium text-muted-foreground"
                            >
                                <option value="featured">Recomendados</option>
                                <option value="newest">Lo más nuevo</option>
                                <option value="price-asc">Precio: Menor a Mayor</option>
                                <option value="price-desc">Precio: Mayor a Menor</option>
                            </select>
                        </div>

                        {/* Buscador y filtro de color */}
                        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
                            {/* Search Input */}
                            <div className="w-full md:w-[250px]">
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
