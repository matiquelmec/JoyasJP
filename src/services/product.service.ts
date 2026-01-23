import { normalizeColor } from '@/lib/utils'
import { supabase } from '@/lib/supabase-client'
import { Product, DatabaseProduct } from '@/lib/types'

/**
 * Adaptador seguro para convertir tipos de base de datos a tipos de aplicación
 * Maneja las discrepancias legacy (camelCase vs snake_case)
 */
function mapDatabaseProductToProduct(dbProduct: DatabaseProduct): Product {
    return {
        ...dbProduct,
        // Garantizar compatibilidad hacia atrás: usar imageUrl (legacy) o image_url (standard DB)
        imageUrl: dbProduct.imageUrl || dbProduct.image_url || '',
        // Asegurar que image_url también exista si se necesita
        image_url: dbProduct.image_url || dbProduct.imageUrl || ''
    } as Product
}

export class ProductService {
    /**
     * Obtiene productos destacados utilizando RPC para máxima eficiencia
     * Lógica optimizada: DB-side randomization
     */
    static async getFeaturedProducts(limit: number = 6): Promise<Product[]> {
        if (!supabase) return []

        try {
            const { data, error } = await supabase.rpc('get_random_products', { limit_count: limit })

            if (error) {
                // console.error('Error fetching featured products:', error)
                return []
            }

            if (!data) return []

            return (data as unknown as DatabaseProduct[]).map(mapDatabaseProductToProduct)
        } catch (error) {
            return []
        }
    }

    /**
     * Obtiene un producto por ID o Slug con validación estricta
     */
    static async getProductById(idOrSlug: string): Promise<Product | null> {
        if (!supabase) return null

        try {
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)

            let query = supabase.from('products').select('*').single()

            if (isUUID) {
                query = query.eq('id', idOrSlug)
            } else {
                query = query.eq('slug', idOrSlug)
            }

            const { data, error } = await query

            if (error || !data) return null

            return mapDatabaseProductToProduct(data as unknown as DatabaseProduct)
        } catch (error) {
            return null
        }
    }

    /**
     * Obtiene productos por IDs (usado en validación de checkout)
     */
    static async getProductsByIds(ids: string[]): Promise<Product[]> {
        if (!supabase || ids.length === 0) return []

        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .in('id', ids)

            if (error || !data) return []

            return (data as unknown as DatabaseProduct[]).map(mapDatabaseProductToProduct)
        } catch (error) {
            return []
        }
    }

    /**
     * Obtiene todos los productos con stock > 0
     * Replica la lógica de getProducts en api.ts incluyendo normalización
     */
    static async getAllProducts(): Promise<Product[]> {
        if (!supabase) return []

        try {
            const { data, error } = await supabase
                .from('products')
                .select('*') // stock is included in *
                .gt('stock', 0)

            if (error || !data) return []

            return (data as unknown as DatabaseProduct[]).map(dbProduct => {
                const product = mapDatabaseProductToProduct(dbProduct)
                // Normalización de color específica para evitar "Mixto" vs "Multicolor"
                if (product.color) {
                    product.color = normalizeColor(product.color)
                }
                return product
            })
        } catch (error) {
            return []
        }
    }

    /**
     * Obtiene lista de colores disponibles en productos con stock
     */
    static async getAvailableColors(): Promise<string[]> {
        if (!supabase) return []
        try {
            const { data, error } = await supabase
                .from('products')
                .select('color')
                .gt('stock', 0)
                .not('color', 'is', null)
                .neq('color', '')

            if (error || !data) return []

            return (data as unknown as { color: string }[])
                .map(item => {
                    if (!item.color) return null
                    const normalized = normalizeColor(item.color)
                    if (!normalized || normalized === 'prueba') return null
                    return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase()
                })
                .filter((value): value is string => Boolean(value))
                .filter((value, index, self) => self.indexOf(value) === index)
        } catch {
            return []
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
        if (!supabase) return []

        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('category', category)
                .neq('id', currentProductId)
                .gt('stock', 0)
                .limit(limit)

            if (error || !data) return []

            return (data as unknown as DatabaseProduct[]).map(dbProduct => {
                const product = mapDatabaseProductToProduct(dbProduct)
                if (product.color) {
                    product.color = normalizeColor(product.color)
                }
                return product
            })
        } catch (error) {
            return []
        }
    }
}
