import { NextResponse } from 'next/server'
import { turso } from '@/lib/db/turso'

export const dynamic = 'force-dynamic'

export async function GET() {
  const start = performance.now()
  try {
    await turso.execute('SELECT 1')
    const latencyMs = Math.round(performance.now() - start)

    return NextResponse.json(
      {
        status: 'ok',
        service: 'joyas-jp-vault-engine',
        database: {
          connected: true,
          latencyMs,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start)
    return NextResponse.json(
      {
        status: 'degraded',
        service: 'joyas-jp-vault-engine',
        database: {
          connected: false,
          latencyMs,
          error: error instanceof Error ? error.message : 'Database unreachable',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
