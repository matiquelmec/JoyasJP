import { createClient } from '@supabase/supabase-js'

let supabase: ReturnType<typeof createClient> | undefined
let clientInitialized = false

function initializeSupabase() {
  if (clientInitialized) {
    return supabase
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseAnonKey) {
    try {
      supabase = createClient(supabaseUrl, supabaseAnonKey)
      console.log('✅ Supabase client initialized on demand')
    } catch (error) {
      console.error('❌ Failed to initialize Supabase client:', error)
      supabase = undefined
    }
  } else {
    console.warn('Supabase URL or Anon Key are missing. Supabase client will not be initialized.')
  }

  clientInitialized = true
  return supabase
}

// Export function to get client on demand
export function getSupabase() {
  return initializeSupabase()
}

// Legacy export for backward compatibility - but uses lazy initialization
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    const client = initializeSupabase()
    return client ? client[prop] : undefined
  }
})
