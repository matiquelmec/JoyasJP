import { NextRequest } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'

export const ADMIN_COOKIE_NAME = 'joyasjp_admin_session'
const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_API_KEY || 'joyasjp_fallback_secure_key_2026')

/**
 * 🔒 Genera un token JWT firmado de sesión administrativa (expira en 7 días)
 */
export async function createAdminSessionToken(): Promise<string> {
  return await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

/**
 * 🔒 Verifica si la petición contiene una sesión de administrador válida (Cookie HttpOnly o Bearer Header)
 */
export async function verifyAdminAuth(request: NextRequest): Promise<boolean> {
  // 1. Intentar por Cookie HttpOnly (Método moderno y seguro)
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      if (payload && payload.role === 'admin') return true
    } catch {
      // Token inválido o expirado
    }
  }

  // 2. Fallback a Authorization Header (para llamadas API directas y backward-compatibility)
  const authHeader = request.headers.get('authorization')
  const expectedPassword = process.env.ADMIN_API_KEY

  if (expectedPassword && authHeader === `Bearer ${expectedPassword}`) {
    return true
  }

  return false
}

export const UNAUTHORIZED_RESPONSE = {
  error: 'Unauthorized',
  message: 'Debes proporcionar una sesión de administrador válida para acceder a este recurso.'
}
