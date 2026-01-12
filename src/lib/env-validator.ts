/**
 * 🛡️ Env Validator
 * 
 * Valida que todas las variables de entorno críticas estén presentes.
 * Se debe importar al inicio de la aplicación (layout.tsx o middleware).
 */

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_MP_PUBLIC_KEY',
  'MP_ACCESS_TOKEN',
  'ADMIN_API_KEY',
  'NEXT_PUBLIC_SITE_URL'
] as const

export function validateEnv() {
  const missingVars = REQUIRED_ENV_VARS.filter(
    (key) => !process.env[key]
  )

  if (missingVars.length > 0) {
    const errorMsg = `❌ Falta(n) variable(s) de entorno crítica(s): ${missingVars.join(', ')}`
    
    if (process.env.NODE_ENV === 'development') {
      console.error(errorMsg)
      throw new Error(errorMsg)
    } else {
      // En producción, solo logueamos para no romper el renderizado inicial
      // pero el sistema de alerta de performance lo capturará
      console.error(errorMsg)
    }
  }

  return true
}

// Ejecutar validación automáticamente al importar si estamos en el servidor
if (typeof window === 'undefined') {
  validateEnv()
}
