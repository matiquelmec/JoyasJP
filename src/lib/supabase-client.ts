
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
    const error = new Error('CRITICAL: Supabase credentials missing - check environment variables');
    logger.error('Supabase credentials missing', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      NODE_ENV: process.env.NODE_ENV
    }, error);
    
    // En desarrollo, mostrar error claro
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ MISSING ENVIRONMENT VARIABLES:');
      if (!supabaseUrl) console.error('  - NEXT_PUBLIC_SUPABASE_URL');
      if (!supabaseAnonKey) console.error('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
      console.error('Check your .env.local file');
    }
    
    throw error;
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
