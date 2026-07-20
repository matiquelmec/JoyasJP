// ✅ Configuración de base de datos activa: Turso (SQLite distribuido)
// Supabase fue eliminado en la migración a Turso
export const databaseConfig = {
  turso: {
    url: process.env.TURSO_CONNECTION_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
  tables: {
    products: 'products',
    orders: 'orders',
    configuration: 'configuration',
    coupons: 'coupons',
    bundle_items: 'bundle_items',
  },
} as const