import { normalizeColor, getLocalFallbackImage } from '@/lib/utils'
import { turso } from '@/lib/db/turso'
import { Product } from '@/lib/types'

// ⚡ Productos locales de prueba para desarrollo y contingencias (A costo $0 y sin caídas)
export const LOCAL_MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Cadena Cubana Premium",
    slug: "cadena-cubana-premium",
    price: 49990,
    discount_price: 39990,
    stock: 15,
    category: "cadenas",
    imageUrl: "/assets/Cadena 1.jpeg",
    gallery: ["/assets/Cadena 1.jpeg", "/assets/Cadena 2.jpeg"],
    description: "Cadena estilo cubano premium chapada en oro de 18k. Diseño exclusivo y duradero.",
    color: "dorado",
    materials: "Oro 18k",
    custom_label: "HOT",
    created_at: new Date().toISOString()
  },
  {
    id: "2",
    name: "Dije Alien Hype",
    slug: "dije-alien-hype",
    price: 24990,
    stock: 8,
    category: "dijes",
    imageUrl: "/assets/Dijes 1.jpeg",
    gallery: ["/assets/Dijes 1.jpeg", "/assets/Dijes 2.jpeg"],
    description: "Dije con diseño de Alien en plata 925. Un toque futurista e intrépido.",
    color: "plateado",
    materials: "Plata 925",
    custom_label: "NUEVO",
    created_at: new Date().toISOString()
  },
  {
    id: "3",
    name: "Pulsera Tennis Ice",
    slug: "pulsera-tennis-ice",
    price: 89990,
    discount_price: 74990,
    stock: 5,
    category: "pulseras",
    imageUrl: "/assets/Pulsera 1.jpeg",
    gallery: ["/assets/Pulsera 1.jpeg", "/assets/Pulsera 2.jpeg"],
    description: "Pulsera estilo tennis con incrustaciones de circonia premium. Brillo inigualable.",
    color: "plateado",
    materials: "Plata 925",
    custom_label: "EXCLUSIVO",
    created_at: new Date().toISOString()
  },
  {
    id: "4",
    name: "Cadena Rope Twist",
    slug: "cadena-rope-twist",
    price: 34990,
    stock: 12,
    category: "cadenas",
    imageUrl: "/assets/Cadena 3.jpeg",
    gallery: ["/assets/Cadena 3.jpeg"],
    description: "Cadena trenzada estilo soga fina, ideal para usar con o sin dijes. Plata de ley.",
    color: "plateado",
    materials: "Plata 925",
    created_at: new Date().toISOString()
  },
  {
    id: "5",
    name: "Dije Cruz Templaria",
    slug: "dije-cruz-templaria",
    price: 29990,
    stock: 10,
    category: "dijes",
    imageUrl: "/assets/Dijes 3.jpeg",
    gallery: ["/assets/Dijes 3.jpeg"],
    description: "Dije de Cruz tallada con acabados premium y pulidos a mano.",
    color: "dorado",
    materials: "Oro 18k",
    created_at: new Date().toISOString()
  },
  {
    id: "6",
    name: "Pulsera Esferas Premium",
    slug: "pulsera-esferas-premium",
    price: 42990,
    stock: 7,
    category: "pulseras",
    imageUrl: "/assets/Pulsera 3.jpeg",
    gallery: ["/assets/Pulsera 3.jpeg"],
    description: "Pulsera elástica de esferas premium con broche ajustable de plata.",
    color: "mixto",
    materials: "Plata Bañada en Oro",
    created_at: new Date().toISOString()
  }
];

/**
 * Parsea un campo JSON de forma segura controlando excepciones
 */
function safeParseJSON<T>(val: any, fallback: T): T {
    if (typeof val === 'string') {
        try {
            return JSON.parse(val) as T
        } catch {
            return fallback
        }
    }
    return val || fallback
}

/**
 * Adaptador seguro para convertir tipos de base de datos a tipos de aplicación
 */
function mapDatabaseProductToProduct(dbProduct: any): Product {
    const galleryRaw = safeParseJSON<string[]>(dbProduct.gallery, [])
    const gallery = Array.isArray(galleryRaw) && galleryRaw.length > 0 
        ? galleryRaw 
        : (dbProduct.imageUrl || dbProduct.image_url ? [dbProduct.imageUrl || dbProduct.image_url] : [])

    let imageUrl = dbProduct.imageUrl || dbProduct.image_url || ''
    
    if (imageUrl.includes('supabase')) {
        imageUrl = getLocalFallbackImage(dbProduct.id, dbProduct.category)
    }

    return {
        id: String(dbProduct.id),
        name: dbProduct.name,
        price: Number(dbProduct.price),
        imageUrl: imageUrl,
        category: dbProduct.category,
        dimensions: dbProduct.dimensions || undefined,
        materials: dbProduct.materials || undefined,
        color: dbProduct.color || undefined,
        stock: Number(dbProduct.stock || 0),
        detail: dbProduct.detail || undefined,
        description: dbProduct.description || undefined,
        specifications: safeParseJSON<any>(dbProduct.specifications, undefined),
        gallery: gallery.map((img: string, idx: number) => {
            if (img && img.includes('supabase')) {
                return getLocalFallbackImage(`${dbProduct.id}_${idx}`, dbProduct.category)
            }
            return img || ''
        }) as string[],
        variants: safeParseJSON<any>(dbProduct.variants, undefined),
        sku: dbProduct.sku || undefined,
        seo: safeParseJSON<any>(dbProduct.seo, undefined),
        image_hint: dbProduct.image_hint || undefined,
        deleted_at: dbProduct.deleted_at || undefined,
        slug: dbProduct.slug || undefined,
        discount_price: dbProduct.discount_price ? Number(dbProduct.discount_price) : undefined,
        custom_label: dbProduct.custom_label || undefined,
        is_priority: Boolean(dbProduct.is_priority === 1 || dbProduct.is_priority === true),
        is_bundle: Boolean(dbProduct.is_bundle === 1 || dbProduct.is_bundle === true)
    } as Product
}

export class ProductService {
    /**
     * Calcula una puntuación de relevancia para el ordenamiento inteligente
     */
    private static calculateProductScore(p: Product): number {
        let score = 0
        if (p.is_priority) score += 1000000
        if (p.custom_label) score += 500000
        if (p.discount_price && p.discount_price < p.price) score += 200000
        if (p.created_at) {
            const createdDate = new Date(p.created_at).getTime()
            const now = new Date().getTime()
            const daysSinceCreation = (now - createdDate) / (1000 * 60 * 60 * 24)
            if (daysSinceCreation < 15) {
                score += Math.max(0, (15 - daysSinceCreation) * 5000)
            }
        }
        return score
    }

    /**
     * Resuelve de forma relacional y atómica el stock de los Conjuntos Dinámicos
     */
    private static async resolveBundleStocks(products: Product[]): Promise<Product[]> {
        const bundles = products.filter(p => p.is_bundle)
        if (bundles.length === 0) return products

        const bundleIds = bundles.map(b => b.id)
        const placeholders = bundleIds.map(() => '?').join(',')
        
        try {
            const { rows: bundleItems } = await turso.execute({
                sql: `SELECT bundle_id, product_id, quantity FROM bundle_items WHERE bundle_id IN (${placeholders})`,
                args: bundleIds
            })

            if (bundleItems.length === 0) {
                return products.map(p => p.is_bundle ? { ...p, stock: 0 } : p)
            }

            const productStockMap = new Map<string, number>()
            products.forEach(p => {
                if (!p.is_bundle) {
                    productStockMap.set(p.id, p.stock)
                }
            })

            const missingProductIds = Array.from(new Set(bundleItems.map(item => item.product_id as string)))
                .filter(id => !productStockMap.has(id))

            if (missingProductIds.length > 0) {
                const missingPlaceholders = missingProductIds.map(() => '?').join(',')
                const { rows: missingProducts } = await turso.execute({
                    sql: `SELECT id, stock FROM products WHERE id IN (${missingPlaceholders})`,
                    args: missingProductIds
                })
                missingProducts.forEach(r => {
                    productStockMap.set(String(r.id), Number(r.stock || 0))
                })
            }

            const bundleStocks = new Map<string, number>()
            bundleItems.forEach(item => {
                const bId = item.bundle_id as string
                const pId = item.product_id as string
                const qty = Number(item.quantity || 1)
                const componentStock = productStockMap.get(pId) || 0
                const maxBundles = Math.floor(componentStock / qty)

                if (!bundleStocks.has(bId)) {
                    bundleStocks.set(bId, maxBundles)
                } else {
                    bundleStocks.set(bId, Math.min(bundleStocks.get(bId)!, maxBundles))
                }
            })

            return products.map(p => {
                if (p.is_bundle) {
                    const calculatedStock = bundleStocks.get(p.id) ?? 0
                    return { ...p, stock: calculatedStock }
                }
                return p
            })
        } catch (error) {
            console.error('Error resolving bundle stocks:', error)
            return products.map(p => p.is_bundle ? { ...p, stock: 0 } : p)
        }
    }

    /**
     * Obtiene productos destacados utilizando filtrado inteligente en servidor
     */
    static async getFeaturedProducts(limit: number = 6): Promise<Product[]> {
        try {
            const { rows } = await turso.execute({
                sql: "SELECT * FROM products WHERE (deleted_at IS NULL OR deleted_at = '')",
                args: []
            })

            if (!rows || rows.length === 0) {
                return LOCAL_MOCK_PRODUCTS.slice(0, limit)
            }

            const mapped = rows.map(mapDatabaseProductToProduct)
            const resolved = await this.resolveBundleStocks(mapped)
            
            const sortedProducts = resolved
                .filter(p => p.stock > 0)
                .sort((a, b) => this.calculateProductScore(b) - this.calculateProductScore(a))
                .slice(0, limit)

            return sortedProducts
        } catch (error) {
            console.error('Error in getFeaturedProducts, returning mock:', error)
            return LOCAL_MOCK_PRODUCTS.slice(0, limit)
        }
    }

    /**
     * Obtiene un producto por ID o Slug con validación estricta
     */
    static async getProductById(idOrSlug: string): Promise<Product | null> {
        try {
            const { rows } = await turso.execute({
                sql: "SELECT * FROM products WHERE (id = ? OR slug = ?) AND (deleted_at IS NULL OR deleted_at = '')",
                args: [idOrSlug, idOrSlug]
            })

            if (rows && rows.length > 0) {
                const mapped = mapDatabaseProductToProduct(rows[0])
                const resolved = await this.resolveBundleStocks([mapped])
                const product = resolved[0] || null

                if (product && product.is_bundle) {
                    try {
                        const { rows: bundleItems } = await turso.execute({
                            sql: `SELECT bi.product_id, bi.quantity, p.name, p.imageUrl, p.price, p.slug 
                                  FROM bundle_items bi 
                                  JOIN products p ON bi.product_id = p.id 
                                  WHERE bi.bundle_id = ?`,
                            args: [product.id]
                        })
                        
                        ;(product as any).components = bundleItems.map(item => ({
                            product_id: item.product_id,
                            quantity: Number(item.quantity || 1),
                            name: item.name,
                            imageUrl: item.imageUrl,
                            price: Number(item.price),
                            slug: item.slug
                        }))
                    } catch (err) {
                        console.error('Error loading bundle components in getProductById:', err)
                    }
                }

                return product
            }

            let localProduct = LOCAL_MOCK_PRODUCTS.find(p => p.id === idOrSlug || p.slug === idOrSlug)
            return localProduct || null
        } catch (error) {
            console.error('Error fetching product by ID/Slug, returning mock:', error)
            let localProduct = LOCAL_MOCK_PRODUCTS.find(p => p.id === idOrSlug || p.slug === idOrSlug)
            return localProduct || null
        }
    }

    /**
     * Obtiene productos por IDs (usado en validación de checkout)
     */
    static async getProductsByIds(ids: string[]): Promise<Product[]> {
        if (ids.length === 0) return []

        try {
            const placeholders = ids.map(() => '?').join(',')
            const { rows } = await turso.execute({
                sql: `SELECT * FROM products WHERE id IN (${placeholders})`,
                args: ids
            })

            if (!rows || rows.length === 0) {
                return LOCAL_MOCK_PRODUCTS.filter(p => ids.includes(p.id))
            }

            const mapped = rows.map(mapDatabaseProductToProduct)
            return await this.resolveBundleStocks(mapped)
        } catch (error) {
            console.error('Error in getProductsByIds:', error)
            return LOCAL_MOCK_PRODUCTS.filter(p => ids.includes(p.id))
        }
    }

    /**
     * Obtiene todos los productos ordenados de forma inteligente por defecto
     */
    static async getAllProducts(): Promise<Product[]> {
        try {
            const { rows } = await turso.execute({
                sql: "SELECT * FROM products WHERE (deleted_at IS NULL OR deleted_at = '')",
                args: []
            })

            if (!rows || rows.length === 0) {
                return LOCAL_MOCK_PRODUCTS
            }

            const mapped = rows.map(mapDatabaseProductToProduct)
            const resolved = await this.resolveBundleStocks(mapped)

            const sortedProducts = resolved
                .filter(p => p.stock > 0)
                .sort((a, b) => this.calculateProductScore(b) - this.calculateProductScore(a))

            return sortedProducts.map(product => {
                if (product.color) {
                    product.color = normalizeColor(product.color)
                }
                return product
            })
        } catch (error) {
            console.error('Error in getAllProducts:', error)
            return LOCAL_MOCK_PRODUCTS
        }
    }

    /**
     * Obtiene lista de colores disponibles en productos con stock
     */
    static async getAvailableColors(): Promise<string[]> {
        try {
            const products = await this.getAllProducts()
            const colors = products.map(p => p.color).filter(Boolean) as string[]
            return Array.from(new Set(colors)).map(c => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase())
        } catch {
            const colors = LOCAL_MOCK_PRODUCTS.map(p => p.color).filter(Boolean) as string[]
            return Array.from(new Set(colors))
        }
    }

    /**
     * Obtiene productos relacionados por categoría
     */
    static async getRelatedProducts(
        currentProductId: string,
        category: string,
        limit: number = 4
    ): Promise<Product[]> {
        try {
            const { rows } = await turso.execute({
                sql: "SELECT * FROM products WHERE category = ? AND id != ? AND (deleted_at IS NULL OR deleted_at = '')",
                args: [category, currentProductId]
            })

            if (!rows || rows.length === 0) {
                return LOCAL_MOCK_PRODUCTS
                    .filter(p => p.category === category && p.id !== currentProductId)
                    .slice(0, limit)
            }

            const mapped = rows.map(mapDatabaseProductToProduct)
            const resolved = await this.resolveBundleStocks(mapped)

            return resolved
                .filter(p => p.stock > 0)
                .slice(0, limit)
                .map(product => {
                    if (product.color) {
                        product.color = normalizeColor(product.color)
                    }
                    return product
                })
        } catch (error) {
            console.error('Error in getRelatedProducts:', error)
            return LOCAL_MOCK_PRODUCTS
                .filter(p => p.category === category && p.id !== currentProductId)
                .slice(0, limit)
        }
    }

    /**
     * Obtiene variantes "hermanas" del mismo modelo (mismo nombre y color)
     */
    static async getSiblings(product: Product): Promise<Product[]> {
        try {
            const { rows } = await turso.execute({
                sql: "SELECT * FROM products WHERE name = ? AND color = ? AND (deleted_at IS NULL OR deleted_at = '')",
                args: [product.name, product.color || '']
            })

            if (!rows || rows.length === 0) {
                return LOCAL_MOCK_PRODUCTS.filter(
                    p => p.name === product.name && p.color === product.color && p.id !== product.id
                )
            }

            const mapped = rows.map(mapDatabaseProductToProduct)
            const resolved = await this.resolveBundleStocks(mapped)

            return resolved.filter(p => p.stock > 0 && p.id !== product.id)
        } catch (error) {
            console.error('Error in getSiblings:', error)
            return LOCAL_MOCK_PRODUCTS.filter(
                p => p.name === product.name && p.color === product.color && p.id !== product.id
            )
        }
    }
}
