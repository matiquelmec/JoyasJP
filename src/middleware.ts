import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { ADMIN_COOKIE_NAME, getAdminJwtSecret } from '@/lib/admin-auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Proteger endpoints de administración en el Edge (/api/admin/*) con Cookie HttpOnly JWT
  if (pathname.startsWith('/api/admin')) {
    const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const { payload } = await jwtVerify(sessionCookie, getAdminJwtSecret())
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
