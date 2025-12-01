"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Calendar, CreditCard } from "lucide-react"
import Image from "next/image"

export default function MisPedidosPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [pedidos, setPedidos] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)

  // Redirige a login si el usuario no está autenticado
  useEffect(() => {
    if (!user && !cargando) {
      console.log("No hay usuario, redirigiendo a login...")
      router.push("/acceso-usuarios")
    }
  }, [user, router, cargando])

  // Carga los pedidos del usuario cuando el componente se monta
  useEffect(() => {
    if (user) {
      obtenerPedidos()
    }
  }, [user])

  // Obtiene los pedidos del usuario desde la API
  const obtenerPedidos = async () => {
    if (!user) {
      console.log("No hay usuario, no se pueden cargar pedidos")
      setCargando(false)
      return
    }

    try {
      const response = await fetch(`/api/pedidos?email=${encodeURIComponent(user.email)}`)
      const data = await response.json()
      
      console.log('Datos recibidos de pedidos:', data)
      
      // Extrae el array de pedidos de la respuesta
      if (data.pedidos && Array.isArray(data.pedidos)) {
        setPedidos(data.pedidos)
      } else {
        setPedidos(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Error al cargar pedidos:", error)
      setPedidos([])
    } finally {
      setCargando(false)
    }
  }

  // Determina el color del badge según el estado del pedido
  const obtenerColorEstado = (estado: string) => {
    if (estado === "pendiente") return "secondary"
    if (estado === "confirmado") return "default"
    if (estado === "enviado") return "default"
    if (estado === "entregado") return "outline"
    if (estado === "cancelado") return "destructive"
    return "default"
  }

  // Formatea la fecha en formato local
  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha)
    return date.toLocaleDateString("es-CR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  if (cargando) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Cargando...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24">
        <section className="py-8 md:py-12 bg-secondary/30">
          <div className="container mx-auto px-4">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-center">Mis Pedidos</h1>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4 max-w-5xl">
            {pedidos.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="font-serif text-2xl font-bold mb-2">No tienes pedidos aún</h2>
                <p className="text-muted-foreground">Cuando realices un pedido aparecerá aquí</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pedidos.map((pedido) => (
                  <Card key={pedido._id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Pedido #{pedido.numeroPedido}</CardTitle>
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{formatearFecha(pedido.fechaPedido)}</span>
                          </div>
                        </div>
                        <Badge variant={obtenerColorEstado(pedido.estado)}>
                          {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Lista de productos del pedido */}
                      <div className="space-y-3">
                        {pedido.productos && pedido.productos.map((producto: any, index: number) => (
                          <div key={index} className="flex gap-4 pb-3 border-b last:border-0">
                            <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden bg-muted">
                              <Image
                                src={producto.imagen || "/placeholder.svg"}
                                alt={producto.nombre}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{producto.nombre}</h4>
                              {producto.sku && (
                                <p className="text-xs text-muted-foreground font-mono">{producto.sku}</p>
                              )}
                              <p className="text-sm text-muted-foreground">
                                Cantidad: {producto.cantidad}
                              </p>
                              {producto.color && (
                                <p className="text-sm text-muted-foreground">Color: {producto.color}</p>
                              )}
                              {producto.talla && (
                                <p className="text-sm text-muted-foreground">Talla: {producto.talla}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">₡{producto.subtotal.toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Dirección de envío */}
                      {pedido.direccion && (
                        <div className="pt-3 border-t">
                          <p className="text-sm font-semibold mb-1">Dirección de envío:</p>
                          <p className="text-sm text-muted-foreground">{pedido.direccion}</p>
                        </div>
                      )}

                      {/* Total del pedido */}
                      <div className="flex justify-between items-center pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">Total</span>
                        </div>
                        <span className="text-xl font-bold">₡{pedido.total.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}