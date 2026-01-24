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
        imageUrl: dbProduct.imageUrl || dbProduct.image_url || '',
        image_url: dbProduct.image_url || dbProduct.imageUrl || '',
        // Asegurar que los nuevos campos se mapeen correctamente
        discount_price: dbProduct.discount_price,
        custom_label: dbProduct.custom_label,
        is_priority: dbProduct.is_priority || false
    } as Product
}

export class ProductService {
    /**
     * Calcula una puntuación de relevancia para el ordenamiento inteligente
     * Prioridad: Manual ⭐ > Etiquetas Especiales > Ofertas > Novedades
     */
    private static calculateProductScore(p: DatabaseProduct): number {
        let score = 0

        // 1. Prioridad Manual (Máxima importancia)
        if (p.is_priority) score += 1000000

        // 2. Etiqueta Especial (Badge personalizado)
        if (p.custom_label) score += 500000

        // 3. Oferta (Precio rebajado)
        if (p.discount_price && p.discount_price < p.price) score += 200000

        // 4. Lógica de Novedad (Automática por fecha)
        if (p.created_at) {
            const createdDate = new Date(p.created_at).getTime()
            const now = new Date().getTime()
            const daysSinceCreation = (now - createdDate) / (1000 * 60 * 60 * 24)

            // Si tiene menos de 15 días, escala de puntos
            if (daysSinceCreation < 15) {
                score += Math.max(0, (15 - daysSinceCreation) * 5000)
            }
        }

        return score
    }

    /**
     * Obtiene productos destacados utilizando filtrado inteligente en servidor
     */
    static async getFeaturedProducts(limit: number = 6): Promise<Product[]> {
        try {
            // Traemos productos con stock
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .gt('stock', 0)

            if (error || !data) return []

            // Ordenamos por puntuación y limitamos
            const sortedProducts = (data as unknown as DatabaseProduct[])
                .sort((a, b) => this.calculateProductScore(b) - this.calculateProductScore(a))
                .slice(0, limit)

            return sortedProducts.map(mapDatabaseProductToProduct)
        } catch (error) {
            console.error('Error in getFeaturedProducts:', error)
            return []
        }
    }

    /**
     * Obtiene un producto por ID o Slug con validación estricta
     */
    static async getProductById(idOrSlug: string): Promise<Product | null> {
        try {
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)

            let query = supabase.from('products').select('*')

            if (isUUID) {
                query = query.eq('id', idOrSlug)
            } else {
                query = query.eq('slug', idOrSlug)
            }

            const { data, error } = await query.single()

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
        if (ids.length === 0) return []

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
     * Obtiene todos los productos ordenados de forma inteligente por defecto
     */
    static async getAllProducts(): Promise<Product[]> {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .gt('stock', 0)

            if (error || !data) return []

            const sortedProducts = (data as unknown as DatabaseProduct[])
                .sort((a, b) => this.calculateProductScore(b) - this.calculateProductScore(a))

            return sortedProducts.map(dbProduct => {
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

    /**
     * Obtiene lista de colores disponibles en productos con stock
     */
    static async getAvailableColors(): Promise<string[]> {
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
