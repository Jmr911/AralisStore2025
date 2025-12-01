"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useCart } from "@/components/cart-provider"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { CheckCircle2, Loader2 } from "lucide-react"
import Image from "next/image"

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    notas: ""
  })
  
  const [retiroEnLocal, setRetiroEnLocal] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [pedidoCompletado, setPedidoCompletado] = useState(false)
  const [numeroPedido, setNumeroPedido] = useState("")

  // Autocompleta el formulario con los datos del usuario si está logueado
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nombre: user.name || "",
        email: user.email || ""
      }))
    }
  }, [user])

  // Redirige al carrito si está vacío
  if (items.length === 0 && !pedidoCompletado) {
    router.push("/carrito")
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Procesa y envía el pedido al servidor
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)

    try {
      const response = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items,
          total: total,
          userName: formData.nombre,
          userEmail: formData.email,
          telefonoContacto: formData.telefono,
          direccionEnvio: retiroEnLocal ? "Retiro en local" : formData.direccion,
          notasAdicionales: formData.notas,
          tipoEntrega: retiroEnLocal ? "retiro" : "envio"
        })
      })

      const resultado = await response.json()

      if (resultado.success) {
        setNumeroPedido(resultado.pedido.numeroPedido)
        setPedidoCompletado(true)
        clearCart()
        enviarWhatsApp(resultado.pedido)
        window.scrollTo(0, 0)
      } else {
        alert("Hubo un error al procesar tu pedido. Intenta de nuevo.")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Hubo un error al procesar tu pedido. Intenta de nuevo.")
    } finally {
      setCargando(false)
    }
  }

  // Crea el mensaje de WhatsApp con los detalles del pedido
  const enviarWhatsApp = (pedido: any) => {
    let mensaje = `*Nuevo Pedido #${pedido.numeroPedido}*\n\n`
    mensaje += `*Cliente:* ${formData.nombre}\n`
    mensaje += `*Email:* ${formData.email}\n`
    mensaje += `*Teléfono:* ${formData.telefono}\n`
    
    if (retiroEnLocal) {
      mensaje += `*Entrega:* Retiro en local\n\n`
    } else {
      mensaje += `*Dirección:* ${formData.direccion}\n\n`
    }
    
    mensaje += `*Productos:*\n`
    
    items.forEach((item: any) => {
      mensaje += `• ${item.name} (x${item.quantity})\n`
      if (item.sku) mensaje += `  ${item.sku}\n`
      if (item.color) mensaje += `  Color: ${item.color}\n`
      if (item.talla) mensaje += `  Talla: ${item.talla}\n`
      mensaje += `  ₡${item.price.toLocaleString()}\n\n`
    })
    
    mensaje += `*Total: ₡${total.toLocaleString()}*`
    
    if (formData.notas) {
      mensaje += `\n\n*Notas:* ${formData.notas}`
    }

    const urlMensaje = encodeURIComponent(mensaje)
    const numeroWhatsApp = "83195781"
    window.open(`https://wa.me/${numeroWhatsApp}?text=${urlMensaje}`, "_blank")
  }

  // Pantalla de confirmación de pedido exitoso
  if (pedidoCompletado) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-600" />
              <h2 className="font-serif text-2xl font-bold mb-2">¡Pedido Realizado!</h2>
              <p className="text-muted-foreground mb-4">
                Tu número de pedido es:
              </p>
              <p className="text-2xl font-bold mb-6 text-primary">{numeroPedido}</p>
              <p className="text-sm text-muted-foreground mb-6">
                Gracias por tu compra. En breve nos comunicaremos por medio del correo para confirmar tu pedido.
              </p>
              <div className="space-y-3">
                <Button className="w-full" onClick={() => router.push("/")}>
                  Volver al inicio
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push("/mis-pedidos")}>
                  Ver mis pedidos
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  // Formulario principal de checkout
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-12 md:py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-center">Finalizar Compra</h1>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Formulario de datos del cliente */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Información de Contacto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="nombre">Nombre completo *</Label>
                        <Input
                          id="nombre"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          required
                          placeholder="Tu nombre"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">Correo electrónico *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="tu@email.com"
                        />
                      </div>

                      <div>
                        <Label htmlFor="telefono">Teléfono *</Label>
                        <Input
                          id="telefono"
                          name="telefono"
                          type="tel"
                          value={formData.telefono}
                          onChange={handleChange}
                          required
                          placeholder="8888-8888"
                        />
                      </div>

                      {/* Opción de retiro en local */}
                      <div className="flex items-center space-x-2 p-4 border rounded-md">
                        <Checkbox
                          id="retiro"
                          checked={retiroEnLocal}
                          onCheckedChange={(checked) => setRetiroEnLocal(checked as boolean)}
                        />
                        <label
                          htmlFor="retiro"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Retiro en local (sin costo de envío)
                        </label>
                      </div>

                      {/* Dirección de envío (solo si no es retiro en local) */}
                      {!retiroEnLocal && (
                        <div>
                          <Label htmlFor="direccion">Dirección de envío *</Label>
                          <Textarea
                            id="direccion"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                            required
                            placeholder="Dirección completa para el envío"
                            rows={3}
                          />
                        </div>
                      )}

                      <div>
                        <Label htmlFor="notas">Notas adicionales (opcional)</Label>
                        <Textarea
                          id="notas"
                          name="notas"
                          value={formData.notas}
                          onChange={handleChange}
                          placeholder="Instrucciones especiales, preferencias de horario, etc."
                          rows={3}
                        />
                      </div>

                      <Button type="submit" className="w-full" size="lg" disabled={cargando}>
                        {cargando ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          "Confirmar Pedido"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Resumen del pedido */}
              <div>
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Resumen del Pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {items.map((item: any) => (
                        <div key={item.id} className="flex gap-3 text-sm">
                          <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-muted">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.name}</p>
                            <p className="text-muted-foreground text-xs">
                              Cantidad: {item.quantity}
                            </p>
                            {item.color && (
                              <p className="text-muted-foreground text-xs">Color: {item.color}</p>
                            )}
                            {item.talla && (
                              <p className="text-muted-foreground text-xs">Talla: {item.talla}</p>
                            )}
                            <p className="font-medium">₡{(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₡{total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Envío</span>
                        <span>{retiroEnLocal ? "Gratis (Retiro)" : "Por calcular"}</span>
                      </div>
                    </div>

                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span>₡{total.toLocaleString()}</span>
                    </div>
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