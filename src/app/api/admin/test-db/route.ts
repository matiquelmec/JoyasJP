import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  // Check auth - try multiple methods
  const authHeader = request.headers.get('authorization')
  const searchParams = request.nextUrl.searchParams
  const queryAuth = searchParams.get('auth')
  
  // Accept auth from header or query param for testing
  const isAuthorized = authHeader === 'Bearer joyasjp2024' || 
                       queryAuth === 'joyasjp2024'
  
  if (!isAuthorized) {
    return NextResponse.json({ 
      error: 'Unauthorized',
      hint: 'Use ?auth=joyasjp2024 in URL or Authorization header',
      receivedHeader: authHeader ? 'Present but incorrect' : 'Missing',
      receivedQuery: queryAuth ? 'Present but incorrect' : 'Missing'
    }, { status: 401 })
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
    // Create client
    const client = createClient(supabaseUrl, supabaseServiceKey)

    // Test 1: Get existing products
    const { data: existingProducts, error: selectError } = await client
      .from('products')
      .select('*')
      .limit(3)


    // Test 2: Try inserting a minimal product
    const testProduct = {
      id: 'test-' + Date.now(),
      name: 'Test Product ' + Date.now(),
      price: 1000,
      category: 'cadenas',
      stock: 1
    }


    const { data: insertData, error: insertError } = await client
      .from('products')
      .insert([testProduct])
      .select()


    // Clean up test product if it was created
    if (insertData && insertData[0]) {
      await client
        .from('products')
        .delete()
        .eq('id', testProduct.id)
    }

    return NextResponse.json({
      success: true,
      environment: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseServiceKey,
        url: supabaseUrl?.substring(0, 30) + '...'
      },
      tests: {
        select: {
          success: !selectError,
          error: selectError?.message,
          sampleColumns: existingProducts?.[0] ? Object.keys(existingProducts[0]) : [],
          sampleProduct: existingProducts?.[0] || null
        },
        insert: {
          success: !insertError,
          error: insertError?.message,
          code: insertError?.code,
          details: insertError?.details,
          hint: insertError?.hint,
          testData: testProduct
        }
      }
    })

  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Test failed',
      details: error?.message || 'Unknown error'
    }, { status: 500 })
  }
}