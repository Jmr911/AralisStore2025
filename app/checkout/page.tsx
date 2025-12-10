"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCart } from "@/components/cart-provider"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { CheckCircle2, Loader2 } from "lucide-react"
import Image from "next/image"

const provincias = [
  { value: "san-jose", label: "San José" },
  { value: "alajuela", label: "Alajuela" },
  { value: "cartago", label: "Cartago" },
  { value: "heredia", label: "Heredia" },
  { value: "guanacaste", label: "Guanacaste" },
  { value: "puntarenas", label: "Puntarenas" },
  { value: "limon", label: "Limón" }
]

// Cantones por provincias de Costa Rica
const cantonesPorProvincia: Record<string, string[]> = {
  "san-jose": ["San José", "Escazú", "Desamparados", "Puriscal", "Tarrazú", "Aserrí", "Mora", "Goicoechea", "Santa Ana", "Alajuelita", "Vázquez de Coronado", "Acosta", "Tibás", "Moravia", "Montes de Oca", "Turrubares", "Dota", "Curridabat", "Pérez Zeledón", "León Cortés Castro"],
  "alajuela": ["Alajuela", "San Ramón", "Grecia", "San Mateo", "Atenas", "Naranjo", "Palmares", "Poás", "Orotina", "San Carlos", "Zarcero", "Sarchí", "Upala", "Los Chiles", "Guatuso", "Río Cuarto"],
  "cartago": ["Cartago", "Paraíso", "La Unión", "Jiménez", "Turrialba", "Alvarado", "Oreamuno", "El Guarco"],
  "heredia": ["Heredia", "Barva", "Santo Domingo", "Santa Bárbara", "San Rafael", "San Isidro", "Belén", "Flores", "San Pablo", "Sarapiquí"],
  "guanacaste": ["Liberia", "Nicoya", "Santa Cruz", "Bagaces", "Carrillo", "Cañas", "Abangares", "Tilarán", "Nandayure", "La Cruz", "Hojancha"],
  "puntarenas": ["Puntarenas", "Esparza", "Buenos Aires", "Montes de Oro", "Osa", "Quepos", "Golfito", "Coto Brus", "Parrita", "Corredores", "Garabito"],
  "limon": ["Limón", "Pococí", "Siquirres", "Talamanca", "Matina", "Guácimo"]
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  
  // Datos del formulario de contacto
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    notas: ""
  })
  
  const [tipoEntrega, setTipoEntrega] = useState<"retiro" | "envio">("retiro")
  
  // Datos de ubicación para envío
  const [datosEnvio, setDatosEnvio] = useState({
    provincia: "",
    canton: "",
    distrito: "",
    direccionExacta: ""
  })
  
  const [cantonesDisponibles, setCantonesDisponibles] = useState<string[]>([])
  const [cargando, setCargando] = useState(false)
  const [pedidoCompletado, setPedidoCompletado] = useState(false)
  const [numeroPedido, setNumeroPedido] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Funcion que ayuda a autocompletar con datos del usuario logueado
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nombre: user.name || "",
        email: user.email || ""
      }))
    }
  }, [user])

  // Redirigir si el carrito está vacío
  useEffect(() => {
    if (mounted && items.length === 0 && !pedidoCompletado) {
      router.push("/carrito")
    }
  }, [mounted, items.length, pedidoCompletado, router])

  // Actualizar cantones según provincia seleccionada
  useEffect(() => {
    if (datosEnvio.provincia) {
      setCantonesDisponibles(cantonesPorProvincia[datosEnvio.provincia] || [])
      setDatosEnvio(prev => ({
        ...prev,
        canton: "",
        distrito: ""
      }))
    } else {
      setCantonesDisponibles([])
    }
  }, [datosEnvio.provincia])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleEnvioChange = (campo: string, valor: string) => {
    setDatosEnvio({
      ...datosEnvio,
      [campo]: valor
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar campos de envío si es necesario
    if (tipoEntrega === "envio") {
      if (!datosEnvio.provincia || !datosEnvio.canton || !datosEnvio.distrito || !datosEnvio.direccionExacta.trim()) {
        alert("Por favor complete todos los campos de envío")
        return
      }
    }

    setCargando(true)

    try {
      // Preparar dirección completa
      let direccionCompleta = "Retiro en local"
      if (tipoEntrega === "envio") {
        const provinciaLabel = provincias.find(p => p.value === datosEnvio.provincia)?.label || ""
        direccionCompleta = `${provinciaLabel}, ${datosEnvio.canton}, ${datosEnvio.distrito} - ${datosEnvio.direccionExacta}`
      }

      const response = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items,
          total: total,
          userName: formData.nombre,
          userEmail: formData.email,
          telefonoContacto: formData.telefono,
          direccionEnvio: direccionCompleta,
          notasAdicionales: formData.notas,
          tipoEntrega: tipoEntrega,
          datosEnvio: tipoEntrega === "envio" ? datosEnvio : null
        })
      })

      const resultado = await response.json()

      if (resultado.success) {
        setNumeroPedido(resultado.pedido.numeroPedido)
        setPedidoCompletado(true)
        clearCart()
        enviarWhatsApp(resultado.pedido, direccionCompleta)
        if (typeof window !== 'undefined') {
          window.scrollTo(0, 0)
        }
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

  // Enviar notificación por WhatsApp
  const enviarWhatsApp = (pedido: any, direccionCompleta: string) => {
    if (typeof window === 'undefined') return

    let mensaje = `*Nuevo Pedido #${pedido.numeroPedido}*\n\n`
    mensaje += `*Cliente:* ${formData.nombre}\n`
    mensaje += `*Email:* ${formData.email}\n`
    mensaje += `*Teléfono:* ${formData.telefono}\n`
    
    if (tipoEntrega === "retiro") {
      mensaje += `*Entrega:* Retiro en local\n\n`
    } else {
      mensaje += `*Entrega:* Envío a domicilio\n`
      mensaje += `*Dirección:* ${direccionCompleta}\n\n`
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
    const numeroWhatsApp = "50683195781"
    window.open(`https://wa.me/${numeroWhatsApp}?text=${urlMensaje}`, "_blank")
  }

  if (!mounted) {
    return null
  }

  // Pantalla de confirmación de pedido
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-16 md:py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-center">Finalizar Compra</h1>
          </div>
        </section>

        <section className="py-4">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Formulario de contacto y envío */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Información de Contacto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
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

                      <div className="space-y-3">
                        <Label>Método de entrega *</Label>
                        <RadioGroup value={tipoEntrega} onValueChange={(value) => setTipoEntrega(value as "retiro" | "envio")}>
                          <div className="flex items-center space-x-2 p-4 border rounded-md transition-colors cursor-pointer hover:border-stone-300" onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d4c5a9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <RadioGroupItem value="retiro" id="retiro" />
                            <label
                              htmlFor="retiro"
                              className="text-sm font-medium leading-none cursor-pointer flex-1"
                            >
                              Retiro en local (sin costo de envío)
                            </label>
                          </div>
                          <div className="flex items-center space-x-2 p-4 border rounded-md transition-colors cursor-pointer hover:border-stone-300" onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d4c5a9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <RadioGroupItem value="envio" id="envio" />
                            <label
                              htmlFor="envio"
                              className="text-sm font-medium leading-none cursor-pointer flex-1"
                            >
                              Envío a domicilio
                            </label>
                          </div>
                        </RadioGroup>
                      </div>

                      {tipoEntrega === "envio" && (
                        <div className="space-y-4 p-4 border rounded-md bg-muted/50">
                          <h3 className="font-medium text-sm">Datos de envío</h3>
                          
                          <div>
                            <Label htmlFor="provincia">Provincia *</Label>
                            <Select
                              value={datosEnvio.provincia}
                              onValueChange={(value) => handleEnvioChange("provincia", value)}
                              required
                            >
                              <SelectTrigger id="provincia">
                                <SelectValue placeholder="Seleccione una provincia" />
                              </SelectTrigger>
                              <SelectContent>
                                {provincias.map((provincia) => (
                                  <SelectItem key={provincia.value} value={provincia.value}>
                                    {provincia.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="canton">Cantón *</Label>
                            <Select
                              value={datosEnvio.canton}
                              onValueChange={(value) => handleEnvioChange("canton", value)}
                              disabled={!datosEnvio.provincia}
                              required
                            >
                              <SelectTrigger id="canton">
                                <SelectValue placeholder="Seleccione un cantón" />
                              </SelectTrigger>
                              <SelectContent>
                                {cantonesDisponibles.map((canton) => (
                                  <SelectItem key={canton} value={canton}>
                                    {canton}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="distrito">Distrito *</Label>
                            <Input
                              id="distrito"
                              value={datosEnvio.distrito}
                              onChange={(e) => handleEnvioChange("distrito", e.target.value)}
                              required
                              placeholder="Nombre del distrito"
                            />
                          </div>

                          <div>
                            <Label htmlFor="direccionExacta">Dirección exacta *</Label>
                            <Textarea
                              id="direccionExacta"
                              value={datosEnvio.direccionExacta}
                              onChange={(e) => handleEnvioChange("direccionExacta", e.target.value)}
                              required
                              placeholder="Ej: De la Iglesia Católica, 200m norte, casa color verde con portón negro"
                              rows={3}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Incluye referencias claras para facilitar la entrega
                            </p>
                          </div>
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
                        <span>{tipoEntrega === "retiro" ? "Gratis (Retiro)" : "Por calcular"}</span>
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