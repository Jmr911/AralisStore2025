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
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña son requeridos')
        }

        const client = await clientPromise
        const db = client.db()

        // Buscar usuario
        const user = await db.collection('users').findOne({ 
          email: credentials.email 
        })

        if (!user) {
          throw new Error('Credenciales inválidas')
        }

        // Verificar contraseña
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!passwordMatch) {
          throw new Error('Credenciales inválidas')
        }

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
    maxAge: 10 * 60, // 10 minutos en segundos
    updateAge: 1 * 60, // ✅ CORRECTO: Actualizar cada 1 minuto
  },
  jwt: {
    maxAge: 10 * 60, // 10 minutos en segundos
  },
  pages: {
    signIn: '/acceso-usuarios',  // ✅ CAMBIADO de '/login'
    signOut: '/acceso-usuarios', // ✅ CAMBIADO de '/login'
    error: '/acceso-usuarios',   // ✅ CAMBIADO de '/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role || 'user'
      }
      return token
    },
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