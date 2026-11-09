import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const arcopSchema = z.object({
  fullName: z.string().min(3).max(150),
  rut: z.string().min(8).max(20),
  email: z.string().email(),
  phone: z.string().optional(),
  rightType: z.enum(['acceso', 'rectificacion', 'supresion', 'oposicion', 'bloqueo', 'portabilidad']),
  details: z.string().min(10).max(2000),
  termsAccepted: z.literal(true),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = arcopSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos de solicitud inválidos', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { rightType } = parsed.data
    const timestamp = new Date()
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const folio = `ARCOP-${timestamp.getFullYear()}-${randomSuffix}`

    // Cálculo del plazo legal según Ley N° 21.719
    const isUrgentLock = rightType === 'bloqueo'
    const daysLimit = isUrgentLock ? '2 días hábiles' : '30 días corridos'

    console.info(`[ARCOP] Nueva solicitud registrada - Folio: ${folio}, Tipo: ${rightType}, Plazo: ${daysLimit}`)

    return NextResponse.json({
      success: true,
      folio,
      plazoLegal: daysLimit,
      registeredAt: timestamp.toISOString(),
      message: 'Solicitud registrada correctamente bajo el marco de la Ley N° 21.719.',
    })
  } catch (error) {
    console.error('[ARCOP API Error]:', error)
    return NextResponse.json(
      { error: 'Error interno al procesar la solicitud' },
      { status: 500 }
    )
  }
}
