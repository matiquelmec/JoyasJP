
import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Singleton pattern para evitar múltiples instancias
let supabaseInstance: ReturnType<typeof createClient> | undefined;

function getSupabaseClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    logger.warn('Supabase credentials missing', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey
    });
    return undefined;
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: typeof window !== 'undefined', // Solo persistir en cliente
        autoRefreshToken: typeof window !== 'undefined',
        detectSessionInUrl: typeof window !== 'undefined',
        storageKey: 'joyas-jp-auth' // Clave única para evitar conflictos
      },
      global: {
        headers: {
          'X-Client-Info': 'joyas-jp-web'
        }
      }
    });
    
    logger.info('Supabase client initialized successfully');
    return supabaseInstance;
  } catch (error) {
    logger.error('Failed to initialize Supabase client', {}, error as Error);
    return undefined;
  }
}

export const supabase = getSupabaseClient();
