import { NextRequest } from 'next/server'

/**
 * 🔒 Centralized Admin Authentication
 * 
 * Verifica si la petición tiene una autorización válida
 * basándose en la variable de entorno ADMIN_API_KEY.
 */
export function verifyAdminAuth(request: NextRequest): boolean {
    const authHeader = request.headers.get('authorization')
    // 🛡️ Seguridad: Solo permitir acceso si la variable de entorno está definida
    const expectedPassword = process.env.ADMIN_API_KEY

    // Si no hay clave configurada en el servidor, denegar acceso por defecto (Fail Secure)
    if (!expectedPassword) {
        console.error('❌ ERROR CRÍTICO: ADMIN_API_KEY no está configurada.')
        return false
    }

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
