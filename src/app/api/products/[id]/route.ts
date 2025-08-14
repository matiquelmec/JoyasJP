import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

// Configurar para Edge Runtime (más rápido)
export const runtime = 'edge'

// Endpoint para producto individual con caché agresivo
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      )
    }

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Cache más agresivo para productos individuales
    const productCacheHeaders = {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'CDN-Cache-Control': 'public, s-maxage=86400',
      'Netlify-CDN-Cache-Control': 'public, s-maxage=86400',
    }

    return NextResponse.json(product, { headers: productCacheHeaders })
  } catch (error) {
    // console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
