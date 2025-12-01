"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, Menu, User, X, Package, KeyRound, LogOut, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-provider"
import { useAuth } from "@/components/auth-provider"
import { useState, useEffect } from "react"

export function Header() {
  const { itemCount } = useCart()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // ✅ NUEVO: Determinar la URL de pedidos según el rol
  const pedidosUrl = user?.role === 'admin' ? '/admin/pedidos' : '/mis-pedidos'
  const pedidosTexto = user?.role === 'admin' ? 'Gestión de Pedidos' : 'Mis Pedidos'

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Show header when at top of page
      if (currentScrollY < 10) {
        setIsVisible(true)
      }
      // Hide header when scrolling down, show when scrolling up
      else if (currentScrollY > lastScrollY) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b transition-transform duration-300 py-2 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Logo - Izquierda */}
          <Link href="/" className="flex items-center justify-start">
            <Image
              src="/aralis-logo-sin-slogan.png"
              alt="Aralis"
              width={120}
              height={60}
              className="h-12 w-auto rounded-lg transition-all duration-300"
            />
          </Link>

          {/* Desktop Navigation - Centro */}
          <nav className="hidden md:flex items-center gap-8 justify-center">
            <Link href="/catalogo" className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap">
              Catálogo
            </Link>
            <Link href="/personalizar" className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap">
              Personalizar
            </Link>
            <Link href="/contacto" className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap">
              Contacto
            </Link>
          </nav>

          {/* Actions - Derecha */}
          <div className="flex items-center gap-2 justify-end">
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Hola, {user.name}</span>
                
                {/* ✅ ACTUALIZADO: Botón dinámico según rol */}
                <Link href={pedidosUrl}>
                  <Button variant="ghost" size="sm">
                    {user.role === 'admin' ? (
                      <Shield className="h-4 w-4 mr-2" />
                    ) : (
                      <Package className="h-4 w-4 mr-2" />
                    )}
                    <span className="hidden lg:inline">{pedidosTexto}</span>
                  </Button>
                </Link>
              </div>
            ) : (
              <Link
                href="/acceso-usuarios"
                className="hidden md:flex items-center gap-2 text-sm hover:text-primary transition-colors"
              >
                <User className="h-4 w-4" />
                <span>Ingresar</span>
              </Link>
            )}

            <Link href="/carrito" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Ícono de Cambiar Contraseña */}
            {user && (
              <Link href="/perfil/cambiar-contrasena" title="Cambiar contraseña" className="hidden md:block">
                <Button variant="ghost" size="icon">
                  <KeyRound className="h-4 w-4" />
                </Button>
              </Link>
            )}

            {/* Ícono de Cerrar Sesión */}
            {user && (
              <Button variant="ghost" size="icon" onClick={logout} title="Cerrar sesión" className="hidden md:flex">
                <LogOut className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 flex flex-col gap-4 border-t pt-4">
            <Link href="/catalogo" className="text-sm font-medium hover:text-primary transition-colors">
              Catálogo
            </Link>
            <Link href="/personalizar" className="text-sm font-medium hover:text-primary transition-colors">
              Personalizar
            </Link>
            <Link href="/contacto" className="text-sm font-medium hover:text-primary transition-colors">
              Contacto
            </Link>
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">Hola, {user.name}</span>
                
                {/* Cambiar Contraseña en móvil */}
                <Link href="/perfil/cambiar-contrasena">
                  <Button variant="ghost" size="sm" className="justify-start w-full">
                    <KeyRound className="h-4 w-4 mr-2" />
                    Cambiar Contraseña
                  </Button>
                </Link>
                
                {/* ✅ ACTUALIZADO: Botón dinámico en móvil */}
                <Link href={pedidosUrl}>
                  <Button variant="ghost" size="sm" className="justify-start w-full">
                    {user.role === 'admin' ? (
                      <Shield className="h-4 w-4 mr-2" />
                    ) : (
                      <Package className="h-4 w-4 mr-2" />
                    )}
                    {pedidosTexto}
                  </Button>
                </Link>
                
                <Button variant="ghost" size="sm" onClick={logout} className="justify-start">
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <Link href="/acceso-usuarios" className="text-sm font-medium hover:text-primary transition-colors">
                Ingresar
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}