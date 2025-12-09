// types/next-auth.d.ts
import 'next-auth'

// Extendemos los tipos de NextAuth para incluir campos personalizados
declare module 'next-auth' {
  // Definimos la estructura de la sesión del usuario
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string  // Rol del usuario (admin o user)
    }
  }

  // Definimos la estructura del objeto User
  interface User {
    id: string
    email: string
    name: string
    role: string  // Rol del usuario (admin o user)
  }
}

// Extendemos el tipo JWT para incluir nuestros campos personalizados
declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    email: string
    name: string
    role: string  // Rol del usuario (admin o user)
  }
}