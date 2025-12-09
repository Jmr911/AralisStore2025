"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (updatedUser: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const { data: session, status, update } = useSession()

  // Sincronizamos el estado del usuario con la sesión de NextAuth
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setUser({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role || 'user'
      })
    } else if (status === "unauthenticated") {
      setUser(null)
    }
  }, [session, status])

  const login = async (email: string, password: string) => {
    try {
      // NextAuth maneja la autenticación
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      if (!result?.ok) {
        throw new Error("Error al iniciar sesión")
      }

      console.log("✅ Sesión iniciada correctamente")
      
    } catch (error: any) {
      console.error("Login failed:", error.message)
      throw error
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al registrarse")

      return data
    } catch (error: any) {
      console.error("Register failed:", error.message)
      throw error
    }
  }

  const logout = async () => {
    console.log("👋 Cerrando sesión de:", user?.name)
    await signOut({ redirect: false })
    setUser(null)
    router.push("/")
    router.refresh()
  }

  // Actualiza el usuario cuando se edita el perfil
  // Modifica tanto el estado local como la sesión de NextAuth
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    update({ user: updatedUser })
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook para acceder al contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}