import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { ADMIN_COOKIE_NAME } from '@/lib/admin-auth'

const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_API_KEY || 'joyasjp_fallback_secure_key_2026')

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Proteger rutas de administración en el Edge
  if (pathname.startsWith('/admin')) {
    // Permitir acceso a la página de login
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }

    const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value

    if (!sessionCookie) {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    try {
      const { payload } = await jwtVerify(sessionCookie, JWT_SECRET)
      if (!payload || payload.role !== 'admin') {
        const loginUrl = new URL('/admin/login', request.url)
        return NextResponse.redirect(loginUrl)
      }
    } catch {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
