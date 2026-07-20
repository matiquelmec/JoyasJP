import { createClient } from '@libsql/client'

const url = process.env.TURSO_CONNECTION_URL || ''
const authToken = process.env.TURSO_AUTH_TOKEN || ''

if (!url) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('⚠️ TURSO_CONNECTION_URL no está configurada. Usando fallback SQLite local (local.db).')
  }
}

const config: { url: string; authToken?: string } = {
  url: url || 'file:local.db',
}

if (authToken) {
  config.authToken = authToken
}

export const turso = createClient(config)
