'use client'

import { useCallback, useMemo, useState, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import LazyProductCard from '@/components/shop/lazy-product-card'
import { useMemoizedProducts } from '@/hooks/use-memoized-products'
import { ColorFilter } from '@/components/shop/color-filter'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Product } from '@/lib/types'
import { productConfig } from '@/lib/config'
import { resolveCatalogQuery, getAllowedSubcategories } from '@/lib/taxonomy'
import { useSiteConfig } from '@/hooks/use-site-config'
import { buildWhatsAppUrl, cn } from '@/lib/utils'

interface ShopClientProps {
    initialProducts: Product[]
    initialColors: string[]
}

const allCategories = ['all', ...productConfig.categories.map(c => c.id)]
const PRODUCTS_PER_PAGE = 12

export function ShopClient({ initialProducts, initialColors }: ShopClientProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { config } = useSiteConfig()
    const categoryParam = searchParams.get('categoria') || 'all'
    const subcategoryParam = searchParams.get('subcategoria') || 'all'
    const materialParam = searchParams.get('material') || 'all'
    const maxPriceParam = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null

    const resolvedInitial = resolveCatalogQuery(categoryParam, subcategoryParam)
    const [activeCategory, setActiveCategory] = useState(resolvedInitial.category)
    const [activeSubcategory, setActiveSubcategory] = useState(resolvedInitial.subcategory)
    const [activeColor, setActiveColor] = useState('all')
    const [activeMaterial, setActiveMaterial] = useState(materialParam)
    const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(maxPriceParam)
    const [searchQuery, setSearchQuery] = useState('')
    const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE)
    const [sortBy, setSortBy] = useState('featured')

    // Sincronizar categoría, subcategoría, material y presupuesto si cambia la URL
    useEffect(() => {
        const resolved = resolveCatalogQuery(categoryParam, subcategoryParam)
        setActiveCategory(resolved.category)
        setActiveSubcategory(resolved.subcategory)
        setActiveMaterial(materialParam || 'all')
        setMaxPriceFilter(maxPriceParam && !Number.isNaN(maxPriceParam) ? maxPriceParam : null)
    }, [categoryParam, subcategoryParam, materialParam, maxPriceParam])

    // Optimización: Callback memoizado para el cambio de color
    const handleColorChange = useCallback((value: string) => {
        setActiveColor(value);
    }, []);

    // ⚡ NAVEGACIÓN PROFESIONAL: Actualizar estado y la URL dinámicamente sin parpadeos
    const handleCategoryChange = useCallback((value: string) => {
        setActiveCategory(value)
        setVisibleCount(PRODUCTS_PER_PAGE)

        const params = new URLSearchParams(searchParams.toString())
        if (value === 'all') {
            params.delete('categoria')
        } else {
            params.set('categoria', value)
        }
        if (value === 'relojes') {
            setActiveSubcategory('all')
            params.delete('subcategoria')
        }

        const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
        router.push(newUrl, { scroll: false })
    }, [pathname, router, searchParams])

    const handleSubcategoryChange = useCallback((value: string) => {
        setActiveSubcategory(value)
        setVisibleCount(PRODUCTS_PER_PAGE)

        const params = new URLSearchParams(searchParams.toString())
        if (value === 'all') {
            params.delete('subcategoria')
        } else {
            params.set('subcategoria', value)
        }

        const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
        router.push(newUrl, { scroll: false })
    }, [pathname, router, searchParams])

    const handleSortChange = useCallback((value: string) => {
        setSortBy(value)
        setVisibleCount(PRODUCTS_PER_PAGE)
    }, [])

    const handleMaxPriceChange = useCallback((value: number | null) => {
        setMaxPriceFilter(value)
        setVisibleCount(PRODUCTS_PER_PAGE)

        const params = new URLSearchParams(searchParams.toString())
        if (!value || value <= 0) {
            params.delete('maxPrice')
        } else {
            params.set('maxPrice', String(value))
        }

        const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
        router.push(newUrl, { scroll: false })
    }, [pathname, router, searchParams])

    const handleClearAllFilters = useCallback(() => {
        setActiveCategory('all')
        setActiveSubcategory('all')
        setActiveColor('all')
        setActiveMaterial('all')
        setMaxPriceFilter(null)
        setSearchQuery('')
        setVisibleCount(PRODUCTS_PER_PAGE)
        router.push(pathname, { scroll: false })
    }, [pathname, router])

    // ⚡ MEMOIZACIÓN: Filtros de productos optimizados con hook personalizado
    const baseFilteredProducts = useMemoizedProducts({
        products: initialProducts,
        category: activeCategory,
        subcategory: activeSubcategory,
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

    // ⚡ Filtro especial: Categoría 'plata-925', filtro por material y tope de presupuesto del asistente
    const finalFilteredProducts = useMemo(() => {
        let list = filteredProducts

        if (activeCategory === 'plata-925' || activeMaterial === 'plata-925') {
            list = list.filter(p => 
                p.category === 'plata-925' || 
                (p.materials && p.materials.toLowerCase().includes('plata')) ||
                (p.custom_label && p.custom_label.toLowerCase().includes('plata'))
            )
        } else if (activeMaterial === 'acero') {
            list = list.filter(p => (p.materials || '').toLowerCase().includes('acero'))
        } else if (activeMaterial === 'aleacion') {
            list = list.filter(p => {
                const m = (p.materials || '').toLowerCase()
                return m.includes('aleaci') || m.includes('zinc')
            })
        }

        if (maxPriceFilter && maxPriceFilter > 0) {
            list = list.filter(p => (p.discount_price || p.price) <= maxPriceFilter)
        }

        return list
    }, [filteredProducts, activeCategory, activeMaterial, maxPriceFilter])

    // Productos visibles (paginación)
    const visibleProducts = useMemo(() => finalFilteredProducts.slice(0, visibleCount), [finalFilteredProducts, visibleCount])
    const hasMore = visibleCount < finalFilteredProducts.length
    const remaining = finalFilteredProducts.length - visibleCount

    // Configuración narrativa dinámica por categoría principal
    const categoryHeader = useMemo(() => {
        switch (activeCategory) {
            case 'plata-925':
                return {
                    title: 'Plata Italiana 925',
                    subtitle: 'Ley 925 legítima importada de Italia. Peso real, brillo de ley y acabado pulido a mano.',
                    badge: '🇮🇹 PLATA ITALIANA LEY 925'
                }
            case 'acero-inoxidable':
                return {
                    title: 'Acero Inoxidable',
                    subtitle: 'Acero quirúrgico 316L de alta resistencia. Cadenas, dijes, pulseras y aros para uso diario.',
                    badge: null
                }
            case 'enchapado-plata':
                return {
                    title: 'Enchapado de Plata',
                    subtitle: 'Piezas con baño de plata de brillo duradero y diseño urbano.',
                    badge: null
                }
            case 'aleacion-zinc':
                return {
                    title: 'Aleación de Zinc',
                    subtitle: 'Dijes, cadenas y conjuntos statement con actitud urbana.',
                    badge: null
                }
            case 'relojes':
                return {
                    title: 'Relojes',
                    subtitle: 'Prestigio atemporal en tu muñeca.',
                    badge: null
                }
            default:
                return {
                    title: 'Nuestra Colección',
                    subtitle: 'Define tu flow con cada pieza. Joyería urbana premium de plata italiana 925, acero inoxidable y relojes.',
                    badge: null
                }
        }
    }, [activeCategory])

    const isSilverBg = activeCategory === 'plata-925'

    return (
        <div className={cn("min-h-screen overflow-x-hidden transition-all duration-700", isSilverBg ? "smoke-silver-bg" : "smoke-gold-bg")}>
            <div className="w-full px-4 sm:px-8 lg:px-14 py-28 md:py-36">
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
                    value={activeCategory}
                    className="w-full"
                    onValueChange={handleCategoryChange}
                >
                    {/* 📱 BARRA DE CATEGORÍAS APP-LIKE CON FADE EDGES Y SCROLL OCULTO */}
                    <div className="relative mb-8 w-full group">
                      {/* Fade edge derecho indicando scroll */}
                      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none md:hidden" />
                      
                      <TabsList className="flex w-full overflow-x-auto scrollbar-none h-auto p-1.5 bg-zinc-950/90 border border-zinc-800/80 rounded-xl justify-start md:justify-center md:flex-wrap gap-1.5 shadow-2xl backdrop-blur-md">
                          {allCategories.map((catId) => {
                              const isVip = catId === 'plata-925'
                              const catObj = productConfig.categories.find(c => c.id === catId)
                              const label = catId === 'all' ? 'Todos' : (catObj?.name || catId)
                              const targetHref = catId === 'all' ? '/productos' : `/productos?categoria=${catId}`

                              return (
                                  <TabsTrigger
                                      key={catId}
                                      value={catId}
                                      asChild
                                      className={cn(
                                          "min-h-[44px] px-4 py-2.5 text-xs font-bold tracking-wider transition-all duration-300 rounded-lg flex-shrink-0 flex items-center gap-1.5 cursor-pointer select-none",
                                          isVip 
                                              ? "data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-200 data-[state=active]:to-slate-400 data-[state=active]:text-slate-950 border border-slate-400/40 text-slate-300 shadow-[0_0_15px_rgba(226,232,240,0.2)]" 
                                              : "data-[state=active]:bg-[#D4113C] data-[state=active]:text-white"
                                      )}
                                  >
                                      <Link href={targetHref} scroll={false}>
                                          {label}
                                      </Link>
                                  </TabsTrigger>
                              )
                          })}
                      </TabsList>
                    </div>

                    {/* Nivel 2: Subcategorías por Tipo de Pieza (oculto en Relojes) */}
                    {activeCategory !== 'relojes' && (
                      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 mb-6 md:justify-center">
                        <button
                          type="button"
                          onClick={() => handleSubcategoryChange('all')}
                          className={cn(
                            'px-3.5 py-2 rounded-full text-xs font-semibold border transition-all whitespace-nowrap min-h-[38px]',
                            activeSubcategory === 'all'
                              ? 'bg-white text-zinc-950 border-white shadow-sm'
                              : 'bg-zinc-950/80 text-zinc-300 border-zinc-800 hover:border-zinc-600'
                          )}
                        >
                          Todos los tipos
                        </button>
                        {getAllowedSubcategories(activeCategory).map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => handleSubcategoryChange(sub.id)}
                            className={cn(
                              'px-3.5 py-2 rounded-full text-xs font-semibold border transition-all whitespace-nowrap min-h-[38px]',
                              activeSubcategory === sub.id
                                ? 'bg-[#D4113C] text-white border-[#D4113C] shadow-sm'
                                : 'bg-zinc-950/80 text-zinc-300 border-zinc-800 hover:border-[#D4113C]/60 hover:text-white'
                            )}
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* ⚡ BARRA COMPACTA DE FILTROS PARA MÓVIL (Grid de 2 columnas en celulares) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row justify-between items-center gap-3 mb-8 w-full">
                        {/* Buscador de Joyas */}
                        <div className="w-full md:w-[240px]">
                            <input
                                type="text"
                                placeholder="🔍 Buscar joyas..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value)
                                    setVisibleCount(PRODUCTS_PER_PAGE)
                                }}
                                className="flex h-11 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3.5 py-2 text-xs font-medium text-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary shadow-inner"
                            />
                        </div>

                        {/* Contenedor secundario: Selector de presupuesto, orden y filtro de color */}
                        <div className="grid grid-cols-1 sm:flex sm:flex-row gap-3 w-full md:w-auto items-center">
                            {/* Selector de Presupuesto */}
                            <div className="w-full sm:w-auto">
                                <select
                                    aria-label="Filtrar por presupuesto máximo"
                                    value={maxPriceFilter ? String(maxPriceFilter) : ''}
                                    onChange={(e) =>
                                        handleMaxPriceChange(e.target.value ? Number(e.target.value) : null)
                                    }
                                    className="flex h-11 w-full sm:w-[165px] rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-xs font-medium text-zinc-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary cursor-pointer shadow-inner"
                                >
                                    <option value="">Todos los precios</option>
                                    <option value="25000">Hasta $25.000</option>
                                    <option value="50000">Hasta $50.000</option>
                                    <option value="90000">Hasta $90.000</option>
                                </select>
                            </div>

                            {/* Selector de Ordenamiento */}
                            <div className="w-full sm:w-auto">
                                <select
                                    aria-label="Ordenar productos"
                                    value={sortBy}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className="flex h-11 w-full sm:w-[160px] md:w-[180px] rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-xs font-medium text-zinc-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary cursor-pointer shadow-inner"
                                >
                                    <option value="featured">Recomendados</option>
                                    <option value="newest">Lo más nuevo</option>
                                    <option value="price-asc">Precio: Menor</option>
                                    <option value="price-desc">Precio: Mayor</option>
                                </select>
                            </div>

                            {/* Color Filter */}
                            <div className="w-full sm:w-auto">
                                <ColorFilter
                                    colors={initialColors}
                                    activeColor={activeColor}
                                    onColorChange={handleColorChange}
                                />
                            </div>
                        </div>
                    </div>

                    <Separator className="mb-12" />

                    {/* Chips de filtros activos */}
                    {(maxPriceFilter || activeColor !== 'all' || searchQuery.trim() !== '') && (
                        <div className="flex flex-wrap items-center gap-2 mb-6">
                            {maxPriceFilter && (
                                <button
                                    type="button"
                                    onClick={() => handleMaxPriceChange(null)}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-[#D4113C]/15 border border-[#D4113C]/40 px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#D4113C]/25 transition-colors"
                                >
                                    <span>Presupuesto: Hasta ${maxPriceFilter.toLocaleString('es-CL')}</span>
                                    <span aria-hidden="true">×</span>
                                </button>
                            )}
                            {activeColor !== 'all' && (
                                <button
                                    type="button"
                                    onClick={() => setActiveColor('all')}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-zinc-500 transition-colors"
                                >
                                    <span>Color: {activeColor}</span>
                                    <span aria-hidden="true">×</span>
                                </button>
                            )}
                            {searchQuery.trim() !== '' && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-zinc-500 transition-colors"
                                >
                                    <span>Búsqueda: &ldquo;{searchQuery.trim()}&rdquo;</span>
                                    <span aria-hidden="true">×</span>
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleClearAllFilters}
                                className="text-xs font-semibold text-zinc-400 hover:text-white underline underline-offset-4 px-2 py-1"
                            >
                                Limpiar todo
                            </button>
                        </div>
                    )}

                    {/* Contador de resultados */}
                    <p className="text-sm text-muted-foreground mb-6">
                        Mostrando <span className="text-foreground font-semibold">{Math.min(visibleCount, finalFilteredProducts.length)}</span> de{' '}
                        <span className="text-foreground font-semibold">{finalFilteredProducts.length}</span> productos
                    </p>

                    {finalFilteredProducts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 w-full">
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
                                        className="group relative inline-flex items-center min-h-[48px] gap-3 px-10 py-4 bg-[#D4113C] text-white font-bold rounded-full transition-all duration-300 hover:bg-[#B30D33] hover:scale-105 shadow-[0_0_24px_rgba(212,17,60,0.4)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#F43F5E]"
                                    >
                                        <span>Cargar más</span>
                                        <span className="text-xs opacity-90">({remaining} restantes)</span>
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
                                        {finalFilteredProducts.length} productos en total
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-20 space-y-5">
                            <h2 className="text-2xl font-semibold">
                                No se encontraron productos
                            </h2>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                {maxPriceFilter
                                    ? `No hay piezas disponibles bajo $${maxPriceFilter.toLocaleString('es-CL')} con esta combinación.`
                                    : 'Prueba a cambiar los filtros seleccionados.'}
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                                {maxPriceFilter && (
                                    <button
                                        type="button"
                                        onClick={() => handleMaxPriceChange(null)}
                                        className="min-h-[44px] rounded-full bg-[#D4113C] hover:bg-[#B30D33] px-6 py-2.5 text-sm font-bold text-white transition-colors"
                                    >
                                        Ver sin límite de precio
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={handleClearAllFilters}
                                    className="min-h-[44px] rounded-full border border-zinc-700 bg-zinc-900 hover:border-zinc-500 px-6 py-2.5 text-sm font-semibold text-zinc-200 transition-colors"
                                >
                                    Limpiar todos los filtros
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Enganche exclusivo al finalizar la categoría Relojes */}
                    {activeCategory === 'relojes' && (
                        <div className="mt-14 rounded-2xl border border-white/15 bg-gradient-to-br from-[#121214] via-[#09090B] to-[#121214] p-8 sm:p-10 text-center shadow-2xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#F43F5E] mb-2">
                                Catálogo Extendido a Pedido
                            </p>
                            <h2 className="text-2xl sm:text-3xl font-bold font-body text-white tracking-tight">
                                ¿Buscas otro modelo? +150 modelos disponibles a pedido
                            </h2>
                            <p className="mt-2.5 text-sm sm:text-base text-[#A1A1AA] max-w-2xl mx-auto">
                                Si no ves el reloj que quieres en stock inmediato, consúltanos directamente por WhatsApp y te cotizamos entre más de 150 modelos a pedido.
                            </p>
                            <div className="mt-6 flex justify-center">
                                <a
                                    href={buildWhatsAppUrl(
                                        config?.whatsapp_number,
                                        'Hola Joyas JP, me gustaría consultar por modelos de relojes a pedido (+150 modelos).'
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2.5 min-h-[48px] rounded-full bg-[#D4113C] hover:bg-[#B30D33] px-8 py-3 text-sm font-bold text-white shadow-[0_0_24px_rgba(212,17,60,0.35)] transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#F43F5E]"
                                >
                                    Consultar modelos a pedido por WhatsApp
                                </a>
                            </div>
                        </div>
                    )}
                </Tabs>
            </div>
        </div>
    )
}
