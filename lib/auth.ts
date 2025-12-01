// lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcrypt'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Verificamos que vengan el email y la contraseña
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña son requeridos')
        }

        const client = await clientPromise
        const db = client.db()

        // Buscamos al usuario por email en la base de datos
        const user = await db.collection('users').findOne({ 
          email: credentials.email 
        })

        if (!user) {
          throw new Error('Credenciales inválidas')
        }

        // Comparamos la contraseña ingresada con la guardada (encriptada)
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!passwordMatch) {
          throw new Error('Credenciales inválidas')
        }

        // Si todo está bien, retornamos los datos del usuario
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.nombre || user.name || user.email.split('@')[0],
          role: user.role || 'user'
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 10 * 60, // la sesión dura 10 minutos
    updateAge: 1 * 60, // se actualiza cada 1 minuto
  },
  jwt: {
    maxAge: 10 * 60, // el token dura 10 minutos
  },
  pages: {
    signIn: '/acceso-usuarios',
    signOut: '/acceso-usuarios',
    error: '/acceso-usuarios',
  },
  callbacks: {
    // Este callback se ejecuta cada vez que se crea o actualiza el token
    async jwt({ token, user, trigger, session }) {
      // Si es un login nuevo, guardamos los datos del usuario en el token
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role || 'user'
      }
      
      // Si se actualizó la sesión manualmente (desde updateUser en auth-provider)
      // esto permite que cuando el usuario edite su perfil, se actualice el nombre en el header
      if (trigger === 'update' && session) {
        token.name = session.user.name
        token.email = session.user.email
      }
      
      return token
    },
    
    // Este callback se ejecuta cada vez que se accede a la sesión
    // convierte el token en un objeto de sesión que podemos usar en la app
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}