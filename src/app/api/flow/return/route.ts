import { type NextRequest, NextResponse } from 'next/server'
import { reconcileFlowOrder } from '@/lib/flow'

/**
 * Endpoint de retorno de Flow (urlReturn).
 * Flow redirige al cliente mediante POST application/x-www-form-urlencoded con `token`.
 * Realiza la conciliación y redirige con HTTP 303 (See Other) a la vitrina.
 */
export async function POST(req: NextRequest) {
  return handleReturn(req)
}

export async function GET(req: NextRequest) {
  return handleReturn(req)
}

async function handleReturn(req: NextRequest) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin).replace(/\/$/, '')

  try {
    let token = ''

    if (req.method === 'POST') {
      const contentType = req.headers.get('content-type') || ''
      if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await req.formData()
        token = String(formData.get('token') || '')
      } else {
        const body = await req.json().catch(() => ({}))
        token = String(body.token || '')
      }
    }

    if (!token) {
      const url = new URL(req.url)
      token = url.searchParams.get('token') || ''
    }

    if (!token) {
      console.warn('⚠️ Flow urlReturn invocado sin token')
      return NextResponse.redirect(`${siteUrl}/productos/failure`, { status: 303 })
    }

    const { status, orderLookupId } = await reconcileFlowOrder(token)

    let targetPath = '/productos/pending'

    if (status === 'paid') {
      targetPath = '/productos/success'
    } else if (status === 'pending') {
      targetPath = '/productos/pending'
    } else {
      targetPath = '/productos/failure'
    }

    const redirectUrl = `${siteUrl}${targetPath}?order_id=${encodeURIComponent(orderLookupId)}`
    return NextResponse.redirect(redirectUrl, { status: 303 })
  } catch (error: any) {
    console.error('Error en Flow urlReturn:', error)
    return NextResponse.redirect(
      `${siteUrl}/productos/failure?error=${encodeURIComponent(error.message || 'Error de pasarela')}`,
      { status: 303 }
    )
  }
}
