import { NextRequest, NextResponse } from 'next/server'
import { createAdminSessionToken, ADMIN_COOKIE_NAME } from '@/lib/admin-auth'
import { adminLoginSchema } from '@/lib/validations/admin'

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json()
    const parsed = adminLoginSchema.safeParse(rawBody)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Solicitud inválida' },
        { status: 400 }
      )
    }

    const { password } = parsed.data
    const expectedPassword = process.env.ADMIN_API_KEY || process.env.ADMIN_PASSWORD

    if (!expectedPassword) {
      console.error('❌ ADMIN_API_KEY / ADMIN_PASSWORD no configurada en el servidor')
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 })
    }

    if (password === expectedPassword) {
      const token = await createAdminSessionToken()
      const response = NextResponse.json({ success: true, message: 'Autenticado correctamente' })

      response.cookies.set({
        name: ADMIN_COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 días
      })

      return response
    }

    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Sesión cerrada' })
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return response
}
