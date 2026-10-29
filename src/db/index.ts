import { drizzle } from 'drizzle-orm/libsql'
import { turso } from '@/lib/db/turso'
import * as schema from './schema'

export const db = drizzle(turso, { schema })
export * from './schema'
