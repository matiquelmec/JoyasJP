
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | undefined
let clientInitialized = false

function initializeSupabase(): SupabaseClient | undefined {
  if (clientInitialized) {
    return supabaseClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseAnonKey) {
    try {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
    } catch (error) {
      console.error('❌ Failed to initialize Supabase client:', error)
      supabaseClient = undefined
    }
  } else {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Supabase URL or Anon Key are missing. Supabase client will not be initialized.')
    }
  }

  clientInitialized = true
  return supabaseClient
}

// Export function to get client on demand
export function getSupabase() {
  return initializeSupabase()
}

// Proxy typed as SupabaseClient to support lazy initialization with strict types
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = initializeSupabase()
    if (!client) {
      // If the client fails to load, we can't really do anything "safe" other than
      // return undefined and let it crash, OR throw a clean error.
      // Throwing a clean error is better for debugging than "cannot read prop of undefined"
      throw new Error('Supabase client is not initialized. Check environment variables.')
    }
    // Reflect.get is safer and correct for Proxy forwarding
    return Reflect.get(client, prop)
  }
})
