export const databaseConfig = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
  tables: {
    products: 'products',
    orders: 'orders', 
    configuration: 'configuration',
  },
  buckets: {
    productImages: 'joyas-jp-ecommerce',
  },
} as const