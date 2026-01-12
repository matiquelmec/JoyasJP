import { MercadoPagoConfig } from 'mercadopago'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Verificar configuración de MercadoPago
    const accessToken = process.env.MP_ACCESS_TOKEN
    const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'MP_ACCESS_TOKEN no configurado'
      }, { status: 500 })
    }

    if (!publicKey) {
      return NextResponse.json({
        success: false,
        error: 'NEXT_PUBLIC_MP_PUBLIC_KEY no configurado'
      }, { status: 500 })
    }

    // Probar inicialización del cliente
    const client = new MercadoPagoConfig({
      accessToken: accessToken,
    })

    return NextResponse.json({
      success: true,
      message: 'MercadoPago configurado correctamente',
      config: {
        hasAccessToken: !!accessToken,
        hasPublicKey: !!publicKey,
        accessTokenPrefix: accessToken.substring(0, 20) + '...',
        publicKeyPrefix: publicKey.substring(0, 20) + '...'
      }
    })

  } catch (error) {
    // console.error('Error testing MercadoPago:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al probar configuración de MercadoPago',
      details: error.message
    }, { status: 500 })
  }
}