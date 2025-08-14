import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customer_name, shipping_address, contact_email, ordered_products } =
      body

    if (
      !customer_name ||
      !shipping_address ||
      !contact_email ||
      !ordered_products
    ) {
      return NextResponse.json(
        { error: 'Missing required order information.' },
        { status: 400 }
      )
    }

    if (!supabase) {
    // console.error('Supabase client is not initialized.')
      return NextResponse.json(
        { error: 'Database connection error.' },
        { status: 500 }
      )
    }

    // Llamamos a la función de la base de datos para manejar la transacción
    const { data, error } = await supabase.rpc(
      'create_order_and_update_stock',
      {
        customer_name_in: customer_name,
        shipping_address_in: shipping_address,
        contact_email_in: contact_email,
        ordered_products_in: ordered_products, // Debe ser un array JSON, ej: [{product_id: 'x', quantity: 1}]
      }
    )

    if (error) {
    // console.error('Supabase function error:', error)
      // El error puede ser por falta de stock, lo cual es un error funcional esperado
      if (error.message.includes('Insufficient stock')) {
        return NextResponse.json(
          {
            error: 'One or more products are out of stock.',
            details: error.message,
          },
          { status: 409 }
        ) // 409 Conflict
      }
      return NextResponse.json(
        { error: 'Failed to process order.', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Order created successfully', order_id: data },
      { status: 201 }
    )
  } catch (error) {
    // console.error('Error processing request:', error)
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    )
  }
}
