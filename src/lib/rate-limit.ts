import { NextRequest, NextResponse } from 'next/server'

interface RateLimitRecord {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitRecord>()

/**
 * 🛡️ Simple In-Memory Rate Limiter para Serverless / Edge
 * Previente ataques de fuerza bruta y DDoS limitando peticiones por IP
 */
export function checkRateLimit(
  request: NextRequest | Request,
  limit: number = 10,
  windowMs: number = 60 * 1000 // 1 minuto por defecto
): { success: boolean; limit: number; remaining: number; reset: number } {
  // Extraer IP de la solicitud
  const ip =
    (request as NextRequest).ip ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'

  const now = Date.now()
  const record = rateLimitMap.get(ip)

  // Si no existe registro o el tiempo expiró, reiniciar ventana
  if (!record || now > record.resetTime) {
    const resetTime = now + windowMs
    rateLimitMap.set(ip, { count: 1, resetTime })
    return { success: true, limit, remaining: limit - 1, reset: resetTime }
  }

  // Si el contador supera el límite, denegar
  if (record.count >= limit) {
    return { success: false, limit, remaining: 0, reset: record.resetTime }
  }

  // Incrementar contador
  record.count += 1
  return { success: true, limit, remaining: limit - record.count, reset: record.resetTime }
}
