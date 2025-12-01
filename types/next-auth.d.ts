// types/next-auth.d.ts
import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string  // Linea de ROLE
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: string  // Linea de ROLE
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    email: string
    name: string
    role: string  // Linea de ROLE
  }
}