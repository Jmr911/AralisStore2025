"use client"

import { SessionProvider } from "next-auth/react"
import type { ReactNode } from "react"

export function NextAuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider
      refetchInterval={5 * 60}        // 🆕 Verificar sesión cada 5 minutos
      refetchOnWindowFocus={true}     // 🆕 Verificar al cambiar de ventana
    >
      {children}
    </SessionProvider>
  )
}