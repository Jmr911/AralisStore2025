import type React from "react"
import { Geist } from "next/font/google"
import { Playfair_Display } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/components/cart-provider"
import { AuthProvider } from "@/components/auth-provider"
import { ScrollToTop } from "@/components/subir-al-inicio"
import { NextAuthProvider } from "@/components/next-auth-provider"
import SessionWarning from "@/components/SessionWarning"

// Fuente principal para el texto del sitio
const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

// Fuente para títulos y texto destacado
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

// Metadatos del sitio (título, descripción, favicon (icono de pestana del navegador))
export const metadata = {
  title: "Aralis - Creatividad a tu medida",
  description: "Confección personalizada de prendas de vestir en Tacacori, Alajuela",
  generator: 'v0.app',
  icons: {
    icon: '/favicon.png',
  },
}

// Estructura base que envuelve todas las páginas
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${geistSans.variable} ${playfair.variable}`}>
      <body className="antialiased">
        {/* NextAuthProvider maneja la autenticación de usuarios */}
        <NextAuthProvider>
          {/* AuthProvider gestiona el estado de login/logout */}
          <AuthProvider>
            {/* CartProvider controla el carrito de compras */}
            <CartProvider>
              {/* Avisa cuando la sesión está por expirar */}
              <SessionWarning />
              {/* Aquí se renderizan las páginas */}
              {children}
              {/* Botón para volver arriba */}
              <ScrollToTop />
            </CartProvider>
          </AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}