
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseAdminClient: SupabaseClient | undefined
let adminClientInitialized = false

function initializeSupabaseAdmin(): SupabaseClient | undefined {
  if (adminClientInitialized) {
    return supabaseAdminClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (supabaseUrl && supabaseServiceKey) {
    try {
      supabaseAdminClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    } catch (error) {
      console.error('❌ Failed to initialize Supabase admin client:', error)
      supabaseAdminClient = undefined
    }
  } else {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Supabase URL or Service Role Key are missing. Admin operations will not be available.')
    }
  }

  adminClientInitialized = true
  return supabaseAdminClient
}

// Export function to get client on demand
export function getSupabaseAdmin() {
  return initializeSupabaseAdmin()
}

// Proxy typed as SupabaseClient to support lazy initialization with strict types
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = initializeSupabaseAdmin()
    if (!client) {
      throw new Error('Supabase admin client is not initialized. Check environment variables.')
    }
    return Reflect.get(client, prop)
  }
})