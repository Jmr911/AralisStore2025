// middleware.ts (en la raíz del proyecto)
// Middleware que protege rutas y verifica autenticación
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Verificamos si el token ha expirado
    if (token?.exp && typeof token.exp === 'number') {
      const now = Math.floor(Date.now() / 1000);
      if (now > token.exp) {
        // Token expirado - redirigimos al login con mensaje de error
        const loginUrl = new URL('/acceso-usuarios', req.url);
        loginUrl.searchParams.set('error', 'SessionExpired');
        loginUrl.searchParams.set('message', 'Tu sesión ha expirado por inactividad');
        return NextResponse.redirect(loginUrl);
      }
    }

    // Verificamos que solo los admins puedan acceder a rutas /admin
    if (path.startsWith('/admin')) {
      if (token?.role !== 'admin') {
        // Si no es admin, redirigimos al inicio
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    // Si todo está bien, permitimos continuar
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Permitimos continuar si hay token (la validación detallada se hace arriba)
        return !!token;
      },
    },
  }
);

// Definimos qué rutas requieren autenticación
export const config = {
  matcher: [
    '/admin/:path*',          // Rutas de administración
    '/perfil/:path*',         // Perfil del usuario
    '/mis-pedidos/:path*',    // Pedidos del usuario
  ],
};