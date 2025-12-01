import type React from "react"
import { Geist } from "next/font/google"
import { Playfair_Display } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/components/cart-provider"
import { AuthProvider } from "@/components/auth-provider"
import { ScrollToTop } from "@/components/subir-al-inicio"
import { NextAuthProvider } from "@/components/next-auth-provider"
import SessionWarning from "@/components/SessionWarning"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata = {
  title: "Aralis - Creatividad a tu medida",
  description: "Confección personalizada de prendas de vestir en Tacacori, Alajuela",
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${geistSans.variable} ${playfair.variable}`}>
      <body className="antialiased">
        <NextAuthProvider>
          <AuthProvider>
            <CartProvider>
              <SessionWarning />
              {children}
              <ScrollToTop />
            </CartProvider>
          </AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}