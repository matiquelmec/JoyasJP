import { type NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/services/order.service'
import { normalizeCanonicalSiteUrl } from '@/lib/flow'
import { flowTokenSchema } from '@/lib/validations/checkout'

export const dynamic = 'force-dynamic'

/**
 * Endpoint de retorno de Flow (urlReturn).
 * Flow redirige al cliente mediante POST application/x-www-form-urlencoded con `token`.
 * Realiza la conciliación idempotente y redirige con HTTP 303 (See Other) a la vitrina.
 */
export async function POST(req: NextRequest) {
  return handleReturn(req)
}

export async function GET(req: NextRequest) {
  return handleReturn(req)
}

async function handleReturn(req: NextRequest) {
  const siteUrl = normalizeCanonicalSiteUrl(
    process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin
  )

  try {
    let rawToken = ''

    if (req.method === 'POST') {
      const contentType = req.headers.get('content-type') || ''
      if (
        contentType.includes('application/x-www-form-urlencoded') ||
        contentType.includes('multipart/form-data')
      ) {
        const formData = await req.formData().catch(() => null)
        rawToken = String(formData?.get('token') || '')
      } else {
        const rawText = await req.text().catch(() => '')
        if (rawText) {
          try {
            const json = JSON.parse(rawText)
            rawToken = String(json?.token || '')
          } catch {
            const params = new URLSearchParams(rawText)
            rawToken = String(params.get('token') || '')
          }
        }
      }
    }

    if (!rawToken) {
      const url = new URL(req.url)
      rawToken = url.searchParams.get('token') || ''
    }

    const parsed = flowTokenSchema.safeParse({ token: rawToken })
    if (!parsed.success) {
      console.warn('⚠️ Flow urlReturn invocado sin token válido')
      return NextResponse.redirect(`${siteUrl}/productos/failure`, { status: 303 })
    }

    const { status, orderLookupId } = await OrderService.reconcileFlowOrder(parsed.data.token)

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
    console.error('❌ Error en Flow urlReturn:', error)
    return NextResponse.redirect(
      `${siteUrl}/productos/failure?error=${encodeURIComponent(error?.message || 'Error de pasarela')}`,
      { status: 303 }
    )
  }
}
