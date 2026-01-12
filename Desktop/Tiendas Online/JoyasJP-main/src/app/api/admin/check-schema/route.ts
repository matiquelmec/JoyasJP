import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({
      error: 'Missing environment variables',
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseServiceKey
    }, { status: 500 })
  }

  try {
    const client = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Obtener información de la tabla
    const { data: tableInfo, error: tableError } = await client
      .from('products')
      .select('*')
      .limit(1)


    // 2. Intentar insertar un producto de prueba para ver el error exacto
    const testProduct = {
      id: 'test-' + Date.now(),
      name: 'Test Product',
      price: 1000,
      category: 'cadenas',
      stock: 10,
      imageUrl: 'https://example.com/test.jpg',
      description: 'Test description'
    }

    const { data: insertTest, error: insertError } = await client
      .from('products')
      .insert([testProduct])
      .select()

    // Si el test funcionó, borrarlo
    if (insertTest && insertTest[0]) {
      await client
        .from('products')
        .delete()
        .eq('id', testProduct.id)
    }

    // 3. Obtener un producto existente para ver su estructura
    const { data: existingProduct, error: existingError } = await client
      .from('products')
      .select('*')
      .limit(1)

    return NextResponse.json({
      success: true,
      tableColumns: tableInfo ? Object.keys(tableInfo[0] || {}) : [],
      sampleProduct: existingProduct?.[0] || null,
      testInsertResult: {
        success: !insertError,
        error: insertError ? {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint
        } : null,
        insertedData: insertTest?.[0] || null
      },
      testProductSent: testProduct,
      environment: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseServiceKey,
        url: supabaseUrl?.substring(0, 30) + '...'
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to check schema',
      details: error?.message || 'Unknown error'
    }, { status: 500 })
  }
}