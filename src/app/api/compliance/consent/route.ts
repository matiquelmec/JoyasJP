import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'

const consentSchema = z.object({
  consentId: z.string().uuid(),
  timestamp: z.string(),
  version: z.string(),
  essential: z.literal(true),
  analytics: z.boolean(),
  marketing: z.boolean(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = consentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Consentimiento no válido' }, { status: 400 })
    }

    // Anonimización criptográfica de IP (SHA-256) para trazabilidad auditable sin almacenar PII
    const rawIp = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'
    const anonymizedIp = crypto.createHash('sha256').update(rawIp).digest('hex').substring(0, 16)

    console.info(`[CMP Audit] Consentimiento registrado: ID=${parsed.data.consentId}, Analytics=${parsed.data.analytics}, Marketing=${parsed.data.marketing}, IP_Hash=${anonymizedIp}`)

    return NextResponse.json({ success: true, recorded: true })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
