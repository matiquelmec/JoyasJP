import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger rutas admin (excepto login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    
    // Verificar si hay una sesión admin válida en las cookies
    const adminAuth = request.cookies.get('admin-auth-storage');
    
    if (!adminAuth) {
      // No hay sesión, redirigir al login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      // Parsear la cookie para verificar la sesión
      const authData = JSON.parse(adminAuth.value);
      
      // Zustand persist almacena el estado directamente, no en un objeto 'state'
      const isAuthenticated = authData?.state?.isAuthenticated;
      const user = authData?.state?.user;
      
      if (!isAuthenticated || !user) {
        // Sesión inválida, redirigir al login
        console.log('Middleware: Sesión inválida', { isAuthenticated, hasUser: !!user });
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      // Verificar si la sesión no ha expirado (8 horas)
      const loginTime = new Date(user.loginTime);
      const now = new Date();
      const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 8) {
        // Sesión expirada, redirigir al login
        console.log('Middleware: Sesión expirada', { hoursDiff });
        const response = NextResponse.redirect(new URL('/admin/login', request.url));
        // Limpiar la cookie expirada
        response.cookies.delete('admin-auth-storage');
        return response;
      }

      // Sesión válida, permitir acceso
      console.log('Middleware: Sesión válida, permitiendo acceso');
      return NextResponse.next();

    } catch (error) {
      // Error al parsear la cookie, redirigir al login
      console.log('Middleware: Error parseando cookie', error);
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Para el login, si ya está autenticado, redirigir al dashboard
  if (pathname === '/admin/login') {
    const adminAuth = request.cookies.get('admin-auth-storage');
    
    if (adminAuth) {
      try {
        const authData = JSON.parse(adminAuth.value);
        const isAuthenticated = authData?.state?.isAuthenticated;
        const user = authData?.state?.user;
        
        if (isAuthenticated && user) {
          // Verificar si la sesión no ha expirado
          const loginTime = new Date(user.loginTime);
          const now = new Date();
          const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
          
          if (hoursDiff <= 8) {
            // Sesión válida, redirigir al dashboard
            console.log('Middleware: Redirigiendo a dashboard desde login');
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
          }
        }
      } catch (error) {
        // Error al parsear, continuar al login
        console.log('Middleware: Error en verificación de login', error);
      }
    }
  }

  // Para otras rutas, continuar normalmente
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Temporalmente deshabilitado para debug
    // '/admin/:path*'
  ]
};