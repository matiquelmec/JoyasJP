import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import { logger, logApiCall } from '@/lib/logger';

export async function POST(request: Request) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    
    // Validar que body sea un objeto
    if (!body || typeof body !== 'object') {
      logger.warn('Invalid request body format', { bodyType: typeof body });
      return NextResponse.json({ error: 'Invalid request format.' }, { status: 400 });
    }
    
    const { customer_name, shipping_address, contact_email, ordered_products } = body;

    // Validación detallada de campos requeridos
    const requiredFields = { customer_name, shipping_address, contact_email, ordered_products };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value || (typeof value === 'string' && value.trim() === ''))
      .map(([key]) => key);
      
    if (missingFields.length > 0) {
      logger.warn('Missing required order fields', { missingFields, providedFields: Object.keys(body) });
      return NextResponse.json({ 
        error: 'Missing required order information.', 
        missingFields 
      }, { status: 400 });
    }
    
    // Validar email formato
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact_email)) {
      logger.warn('Invalid email format', { email: contact_email });
      return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 });
    }
    
    // Validar productos
    if (!Array.isArray(ordered_products) || ordered_products.length === 0) {
      logger.warn('Invalid ordered products', { productsType: typeof ordered_products, length: Array.isArray(ordered_products) ? ordered_products.length : 'N/A' });
      return NextResponse.json({ error: 'Invalid products list.' }, { status: 400 });
    }

    if (!supabase) {
      logger.error('Supabase client not initialized');
      return NextResponse.json({ error: 'Database connection error.' }, { status: 500 });
    }
    
    logger.info('Creating new order', { 
      customerName: customer_name,
      productCount: ordered_products.length 
    });

    // Llamamos a la función de la base de datos para manejar la transacción
    const { data, error } = await supabase.rpc('create_order_and_update_stock', {
      customer_name_in: customer_name,
      shipping_address_in: shipping_address,
      contact_email_in: contact_email,
      ordered_products_in: ordered_products, // Debe ser un array JSON, ej: [{product_id: 'x', quantity: 1}]
    });

    if (error) {
      const duration = Date.now() - startTime;
      logger.error('Supabase function error', { 
        duration,
        errorMessage: error.message,
        customerName: customer_name 
      }, error as any);
      
      // El error puede ser por falta de stock, lo cual es un error funcional esperado
      if (error.message.includes('Insufficient stock')) {
        logApiCall('/api/create-order', 'POST', 409, duration);
        return NextResponse.json({ 
          error: 'One or more products are out of stock.', 
          details: error.message 
        }, { status: 409 }); // 409 Conflict
      }
      
      logApiCall('/api/create-order', 'POST', 500, duration);
      return NextResponse.json({ 
        error: 'Failed to process order.', 
        details: error.message 
      }, { status: 500 });
    }

    const duration = Date.now() - startTime;
    logApiCall('/api/create-order', 'POST', 201, duration);
    logger.info('Order created successfully', { 
      orderId: data,
      customerName: customer_name,
      duration 
    });
    
    return NextResponse.json({ message: 'Order created successfully', order_id: data }, { status: 201 });

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Create order API error', { duration }, error as Error);
    logApiCall('/api/create-order', 'POST', 400, duration);
    
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
}
