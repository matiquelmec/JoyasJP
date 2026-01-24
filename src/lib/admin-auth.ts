import { NextRequest } from 'next/server'

/**
 * 🔒 Centralized Admin Authentication
 * 
 * Verifica si la petición tiene una autorización válida
 * basándose en la variable de entorno ADMIN_API_KEY.
 */
export function verifyAdminAuth(request: NextRequest): boolean {
    const authHeader = request.headers.get('authorization')
    // 🛡️ Seguridad: Fallback a la clave por defecto si no hay env var configurada
    const expectedPassword = process.env.ADMIN_API_KEY || process.env.NEXT_PUBLIC_ADMIN_KEY || 'joyasjp2024'

    if (!authHeader || authHeader !== `Bearer ${expectedPassword}`) {
        return false
    }

    return true
}

/**
 * Helper para estandarizar la respuesta de error de autorización
 */
export const UNAUTHORIZED_RESPONSE = {
    error: 'Unauthorized',
    message: 'Debes proporcionar una API Key válida para acceder a este recurso.'
}
