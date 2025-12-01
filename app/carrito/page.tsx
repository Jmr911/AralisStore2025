"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/components/cart-provider"
import type { CartItem as BaseCartItem } from "@/lib/types"
import Image from "next/image"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Extiende CartItem para incluir variantes de color y talla
type CartItem = BaseCartItem & {
  color?: string
  talla?: string
}

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, total } = useCart()
  const router = useRouter()

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="text-center">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="font-serif text-2xl font-bold mb-2">Tu carrito está vacío</h2>
            <p className="text-muted-foreground mb-6">Agrega productos para comenzar tu compra</p>
            <Button asChild>
              <Link href="/catalogo">Explorar catálogo</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Envía cotización por WhatsApp con detalles de productos
  const handleSolicitudCotizacion = async () => {
    try {
      // Guarda la cotización en la base de datos
      await fetch("/api/cotizacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, total }),
      })
    } catch (error) {
      console.error("Error al guardar la cotización:", error)
    }

    // Construye el mensaje para WhatsApp
    let mensaje = "*Cotización de Productos*\n=========================\n\n"
    items.forEach((item: CartItem) => {
      const subtotal = item.quantity * item.price
      mensaje += `• ${item.name}\n`
      if (item.color) mensaje += `  Color: ${item.color}\n`
      if (item.talla) mensaje += `  Talla: ${item.talla}\n`
      mensaje += `  Cantidad: ${item.quantity}\n`
      mensaje += `  Precio: ₡${item.price.toLocaleString()}\n`
      mensaje += `  Subtotal: ₡${subtotal.toLocaleString()}\n\n`
    })
    mensaje += `=========================\n*Total: ₡${total.toLocaleString()}*\n\nGracias!`

    const urlMensaje = encodeURIComponent(mensaje)
    const numeroWhatsApp = "83195781"
    window.open(`https://wa.me/${numeroWhatsApp}?text=${urlMensaje}`, "_blank")
  }

  // Redirige a la página de checkout
  const handleFinalizarCompra = () => {
    router.push("/checkout")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-12 md:py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-center">Carrito de compras</h1>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Lista de productos en el carrito */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item: CartItem) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold mb-1">{item.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{item.category}</p>
                          {item.color && <p className="text-sm text-muted-foreground mb-1">Color: {item.color}</p>}
                          {item.talla && <p className="text-sm text-muted-foreground mb-1">Talla: {item.talla}</p>}
                          <p className="font-bold">₡{item.price.toLocaleString()}</p>
                        </div>

                        <div className="flex flex-col items-end justify-between">
                          <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-transparent"
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-transparent"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Resumen del carrito y opciones de compra */}
              <div>
                <Card className="sticky top-24">
                  <CardContent className="p-6 space-y-4">
                    <h2 className="font-serif text-2xl font-bold">Resumen</h2>

                    <div className="space-y-2 py-4 border-y">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₡{total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Envío</span>
                        <span>Por calcular</span>
                      </div>
                    </div>

                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>₡{total.toLocaleString()}</span>
                    </div>

                    <Button 
                      className="w-full bg-transparent text-[#3D2817] border-2 border-[#3D2817] hover:bg-[#3D2817] hover:text-white transition-colors" 
                      size="lg" 
                      onClick={handleFinalizarCompra}
                    >
                      Finalizar Compra
                    </Button>

                    <Button 
                      variant="outline"
                      className="w-full border-2 border-[#3D2817] text-[#3D2817] bg-transparent hover:bg-[#3D2817] hover:text-white transition-colors" 
                      size="lg" 
                      onClick={handleSolicitudCotizacion}
                    >
                      Solicitar cotización
                    </Button>

                    <p className="text-xs text-center text-muted-foreground leading-relaxed">
                      Completa tu pedido o solicita una cotización personalizada
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}