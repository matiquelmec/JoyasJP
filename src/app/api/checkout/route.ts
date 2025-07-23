import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { CartItem } from '@/hooks/use-cart';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN! 
});

export async function POST(req: NextRequest) {
  try {
    const cartItems: CartItem[] = await req.json();

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
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
          success: `${req.nextUrl.origin}/shop/success`,
          failure: `${req.nextUrl.origin}/shop/failure`,
          pending: `${req.nextUrl.origin}/shop/pending`,
        },
      },
    });

    return NextResponse.json({ checkoutUrl: preference.init_point });

  } catch (error: any) {
    console.error("Error creating preference:", JSON.stringify(error, null, 2));
    
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

    return new NextResponse(
      JSON.stringify({ error: `Mercado Pago Error: ${errorMessage}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
