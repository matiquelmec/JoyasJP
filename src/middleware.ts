import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { ADMIN_COOKIE_NAME } from '@/lib/admin-auth'

const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_API_KEY || 'joyasjp_fallback_secure_key_2026')

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Proteger endpoints de administración en el Edge (/api/admin/*)
  if (pathname.startsWith('/api/admin')) {
    const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const { payload } = await jwtVerify(sessionCookie, JWT_SECRET)
      if (!payload || payload.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/admin/:path*'],
}
