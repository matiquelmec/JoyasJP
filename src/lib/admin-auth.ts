import { NextRequest } from 'next/server'

/**
 * 🔒 Centralized Admin Authentication
 * 
 * Verifica si la petición tiene una autorización válida
 * basándose en la variable de entorno ADMIN_API_KEY.
 */
export function verifyAdminAuth(request: NextRequest): boolean {
    const authHeader = request.headers.get('authorization')
    const expectedPassword = process.env.ADMIN_API_KEY

    // Prevenir acceso si la variable no está configurada o si el header no coincide
    if (!expectedPassword || !authHeader || authHeader !== `Bearer ${expectedPassword}`) {
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
