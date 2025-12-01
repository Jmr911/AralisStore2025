// middleware.ts (en la raíz del proyecto)
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Verificar expiración del token
    if (token?.exp && typeof token.exp === 'number') {
      const now = Math.floor(Date.now() / 1000);
      if (now > token.exp) {
        // Token expirado - redirigir a acceso-usuarios
        const loginUrl = new URL('/acceso-usuarios', req.url); // ✅ CAMBIADO
        loginUrl.searchParams.set('error', 'SessionExpired');
        loginUrl.searchParams.set('message', 'Tu sesión ha expirado por inactividad');
        return NextResponse.redirect(loginUrl);
      }
    }

    // Verificar permisos de admin
    if (path.startsWith('/admin')) {
      if (token?.role !== 'admin') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Permitir continuar si hay token (validación detallada en middleware)
        return !!token;
      },
    },
  }
);

// Rutas que requieren autenticación
export const config = {
  matcher: [
    '/admin/:path*',
    '/perfil/:path*',
    '/mis-pedidos/:path*',
  ],
};