import { NextRequest } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'

export const ADMIN_COOKIE_NAME = 'joyasjp_admin_session'

/**
 * Obtiene el secreto criptográfico para firmar/verificar el JWT administrativo.
 * Prioriza JWT_SECRET y mantiene retrocompatibilidad con ADMIN_API_KEY / ADMIN_PASSWORD.
 */
export function getAdminJwtSecret(): Uint8Array {
  const rawSecret =
    process.env.JWT_SECRET ||
    process.env.ADMIN_API_KEY ||
    process.env.ADMIN_PASSWORD ||
    (process.env.NODE_ENV !== 'production' ? 'joyasjp_dev_only_jwt_secret_2026' : '')

  if (!rawSecret) {
    throw new Error('JWT_SECRET / ADMIN_API_KEY no configurada en entorno de producción')
  }

  return new TextEncoder().encode(rawSecret)
}

/**
 * 🔒 Genera un token JWT firmado de sesión administrativa (expira en 7 días)
 */
export async function createAdminSessionToken(): Promise<string> {
  return await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getAdminJwtSecret())
}

/**
 * 🔒 Verifica exclusivamente la sesión administrativa mediante Cookie HttpOnly JWT (Zero-Trust).
 */
export async function verifyAdminAuth(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value
  if (!token) {
    return false
  }

  try {
    const { payload } = await jwtVerify(token, getAdminJwtSecret())
    return Boolean(payload && payload.role === 'admin')
  } catch {
    return false
  }
}

export const UNAUTHORIZED_RESPONSE = {
  error: 'Unauthorized',
  message: 'Debes proporcionar una sesión de administrador válida (Cookie HttpOnly JWT).',
}
