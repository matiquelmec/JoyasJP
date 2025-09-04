import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

// Configurar para Edge Runtime (más rápido)
export const runtime = 'edge'

// Cache control headers para Netlify CDN
const cacheHeaders = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
  'CDN-Cache-Control': 'public, s-maxage=300',
  'Netlify-CDN-Cache-Control':
    'public, s-maxage=300, stale-while-revalidate=600',
}

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)

    // Parámetros de paginación
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Parámetros de filtrado
    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Construir query base
    let query = supabase.from('products').select('*', { count: 'exact' })

    // Aplicar filtros
    if (category) {
      query = query.eq('category', category)
    }

    if (minPrice) {
      query = query.gte('price', parseInt(minPrice))
    }

    if (maxPrice) {
      query = query.lte('price', parseInt(maxPrice))
    }

    if (search) {
      // Búsqueda full-text optimizada
      query = query.textSearch('search_vector', search, {
        type: 'websearch',
        config: 'spanish',
      })
    }

    // Aplicar ordenamiento
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Aplicar paginación
    query = query.range(offset, offset + limit - 1)

    const { data: products, error, count } = await query

    if (error) {
    // console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      )
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json(
      {
        products: products || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
          hasMore: page < totalPages,
        },
      },
      { headers: cacheHeaders }
    )
  } catch (error) {
    // console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
