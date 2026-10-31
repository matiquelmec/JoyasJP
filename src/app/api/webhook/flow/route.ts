import { type NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/services/order.service'
import { flowTokenSchema } from '@/lib/validations/checkout'

export const dynamic = 'force-dynamic'

async function extractFlowToken(req: NextRequest): Promise<string> {
  let token = ''

  if (req.method === 'POST') {
    const contentType = req.headers.get('content-type') || ''
    if (
      contentType.includes('application/x-www-form-urlencoded') ||
      contentType.includes('multipart/form-data')
    ) {
      const formData = await req.formData().catch(() => null)
      token = String(formData?.get('token') || '')
    } else {
      const rawText = await req.text().catch(() => '')
      if (rawText) {
        try {
          const json = JSON.parse(rawText)
          token = String(json?.token || '')
        } catch {
          const params = new URLSearchParams(rawText)
          token = String(params.get('token') || '')
        }
      }
    }
  }

  if (!token) {
    const url = new URL(req.url)
    token = url.searchParams.get('token') || ''
  }

  return token.trim()
}

async function handleWebhook(req: NextRequest) {
  try {
    const rawToken = await extractFlowToken(req)
    const parsed = flowTokenSchema.safeParse({ token: rawToken })

    if (!parsed.success) {
      console.warn('⚠️ Webhook Flow recibido sin token válido')
      return NextResponse.json({ error: 'Token missing or invalid' }, { status: 400 })
    }

    const { token } = parsed.data
    console.log(`🔔 Webhook Flow recibido para token: ${token.slice(0, 10)}...`)

    const result = await OrderService.reconcileFlowOrder(token)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('❌ Error procesando Webhook de Flow:', error)
    return NextResponse.json(
      { error: `Flow webhook error: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  return handleWebhook(req)
}

export async function GET(req: NextRequest) {
  return handleWebhook(req)
}
