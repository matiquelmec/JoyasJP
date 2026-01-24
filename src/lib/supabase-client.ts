
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

    if (client) {
      return Reflect.get(client, prop)
    }

    // 🛡️ ESTRATEGIA ROBUSTA: Noop Client para Builds
    // Si no hay cliente, devolvemos funciones Noop que evitan el crash
    // y devuelven arreglos vacíos o nulos de forma segura.
    console.warn(`[Supabase Proxy]: Accediendo a '${String(prop)}' sin cliente inicializado. Usando Noop Mock.`)

    const noop = () => ({
      from: () => noop(),
      select: () => noop(),
      insert: () => noop(),
      update: () => noop(),
      delete: () => noop(),
      single: () => noop(),
      maybeSingle: () => noop(),
      eq: () => noop(),
      order: () => noop(),
      limit: () => noop(),
      rpc: () => noop(),
      then: (callback: any) => Promise.resolve(callback({ data: [], error: null })),
      catch: () => Promise.resolve({ data: [], error: null }),
    })

    return (noop() as any)[prop] || noop
  }
})
