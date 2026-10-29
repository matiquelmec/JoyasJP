/**
 * 🛡️ Env Validator
 * 
 * Valida que todas las variables de entorno críticas estén presentes.
 * Se debe importar al inicio de la aplicación (layout.tsx o middleware).
 */

const REQUIRED_ENV_VARS = [
  'TURSO_CONNECTION_URL',
  'TURSO_AUTH_TOKEN',
  'FLOW_API_KEY',
  'FLOW_SECRET_KEY',
  'ADMIN_API_KEY',
  'NEXT_PUBLIC_SITE_URL',
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
      console.error(errorMsg)
    }
  }

  return true
}

if (typeof window === 'undefined') {
  validateEnv()
}
