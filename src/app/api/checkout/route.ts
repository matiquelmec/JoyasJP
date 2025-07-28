import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { CartItem } from '@/hooks/use-cart';
import { logger, logApiCall } from '@/lib/logger';

// Validar variables de entorno críticas
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
if (!MP_ACCESS_TOKEN) {
  const error = new Error('CRITICAL: MP_ACCESS_TOKEN missing - MercadoPago won\'t work');
  console.error('❌ Missing MP_ACCESS_TOKEN environment variable');
  throw error;
}

const client = new MercadoPagoConfig({ 
  accessToken: MP_ACCESS_TOKEN
});

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const cartItems: CartItem[] = await req.json();
    
    // Validar datos de entrada
    if (!Array.isArray(cartItems)) {
      logger.warn('Invalid cart items format', { received: typeof cartItems });
      return NextResponse.json({ error: "Formato de carrito inválido" }, { status: 400 });
    }

    if (cartItems.length === 0) {
      logger.warn('Empty cart checkout attempt');
      return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
    }
    
    // Validar items del carrito
    for (const item of cartItems) {
      if (!item.id || !item.name || !item.price || !item.quantity) {
        logger.warn('Invalid cart item', { item });
        return NextResponse.json({ error: "Item de carrito inválido" }, { status: 400 });
      }
      if (item.quantity <= 0 || item.price <= 0) {
        logger.warn('Invalid item values', { item });
        return NextResponse.json({ error: "Cantidad o precio inválido" }, { status: 400 });
      }
    }

    const preference = await new Preference(client).create({
      body: {
        items: cartItems.map(item => ({
          id: item.id,
          title: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          currency_id: 'CLP',
          picture_url: item.imageUrl,
          description: item.description,
        })),
        back_urls: {
          success: `${req.nextUrl.origin}/productos/success`,
          failure: `${req.nextUrl.origin}/productos/failure`,
          pending: `${req.nextUrl.origin}/productos/pending`,
        },
      },
    });

    const duration = Date.now() - startTime;
    logApiCall('/api/checkout', 'POST', 200, duration);
    logger.info('Checkout preference created successfully', { 
      itemCount: cartItems.length,
      totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    });
    
    return NextResponse.json({ checkoutUrl: preference.init_point });

  } catch (e: unknown) {
    const duration = Date.now() - startTime;
    const error = e as { cause?: { data?: { message: string }; error: string | object; message: string }; message?: string };
    
    logger.error('Checkout API error', { 
      duration,
      errorType: error.constructor.name,
      hasCause: !!error.cause 
    }, error as Error);
    
    let errorMessage = 'An unknown error occurred.';
    if (error.cause) {
      const cause = error.cause;
      if (cause.data?.message) {
        errorMessage = cause.data.message;
      } else if (typeof cause.error === 'string') {
        errorMessage = cause.error;
      } else {
        errorMessage = JSON.stringify(cause.error) || cause.message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    logApiCall('/api/checkout', 'POST', 500, Date.now() - startTime);
    
    return new NextResponse(
      JSON.stringify({ error: `Mercado Pago Error: ${errorMessage}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
