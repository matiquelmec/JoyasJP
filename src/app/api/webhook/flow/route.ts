import { type NextRequest, NextResponse } from 'next/server'
import { reconcileFlowOrder } from '@/lib/flow'

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let token = ''

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData()
      token = String(formData.get('token') || '')
    } else {
      const body = await req.json().catch(() => ({}))
      token = String(body.token || '')
    }

    if (!token) {
      const url = new URL(req.url)
      token = url.searchParams.get('token') || ''
    }

    if (!token) {
      console.warn('⚠️ Webhook Flow recibido sin token')
      return NextResponse.json({ error: 'Token missing' }, { status: 400 })
    }

    console.log(`🔔 Webhook Flow recibido para token: ${token}`)

    const result = await reconcileFlowOrder(token)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('❌ Error procesando Webhook de Flow:', error)
    return NextResponse.json(
      { error: `Flow webhook error: ${error.message}` },
      { status: 500 }
    )
  }
}
