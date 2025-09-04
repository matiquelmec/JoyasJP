import { createClient } from '@supabase/supabase-js'

let supabaseAdminClient: ReturnType<typeof createClient> | undefined
let adminClientInitialized = false

function initializeSupabaseAdmin() {
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
    // console.log('✅ Supabase admin client initialized on demand')
    } catch (error) {
    // console.error('❌ Failed to initialize Supabase admin client:', error)
      supabaseAdminClient = undefined
    }
  } else {
    // console.warn('Supabase URL or Service Role Key are missing. Admin operations will not be available.')
  }

  adminClientInitialized = true
  return supabaseAdminClient
}

// Export function to get client on demand
export function getSupabaseAdmin() {
  return initializeSupabaseAdmin()
}

// Legacy export for backward compatibility - but uses lazy initialization
export const supabaseAdmin = new Proxy({} as any, {
  get(target, prop) {
    const client = initializeSupabaseAdmin()
    return client ? client[prop] : undefined
  }
})