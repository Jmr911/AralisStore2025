"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Package, Calendar, User, Phone, MapPin, ChevronDown, ChevronUp, Save, Search, Mail } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

export default function AdminPedidosPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [pedidos, setPedidos] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [filtroCliente, setFiltroCliente] = useState<string>("")
  const [pedidoExpandido, setPedidoExpandido] = useState<string | null>(null)
  
  // Guarda cambios de estado temporalmente antes de enviarlos
  const [cambiosPendientes, setCambiosPendientes] = useState<Record<string, string>>({})
  const [guardando, setGuardando] = useState<Record<string, boolean>>({})

  // Unicamente los admins pueden acceder a esta página
  useEffect(() => {
    if (!cargando && (!user || user.role !== 'admin')) {
      console.log("Usuario no es admin, redirigiendo...")
      router.push("/")
    }
  }, [user, router, cargando])

  useEffect(() => {
    if (user && user.role === 'admin') {
      obtenerTodosLosPedidos()
    }
  }, [user])

  // Trae todos los pedidos desde la API
  const obtenerTodosLosPedidos = async () => {
    try {
      const response = await fetch('/api/admin/pedidos')
      
      if (response.status === 403) {
        toast({
          title: "Acceso denegado",
          description: "No tienes permisos de administrador",
          variant: "destructive"
        })
        router.push("/")
        return
      }

      const data = await response.json()
      
      if (data.pedidos && Array.isArray(data.pedidos)) {
        setPedidos(data.pedidos)
      }
    } catch (error) {
      console.error("Error al cargar pedidos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los pedidos",
        variant: "destructive"
      })
    } finally {
      setCargando(false)
    }
  }

  // Guarda temporalmente el cambio sin enviarlo al servidor
  const registrarCambioEstado = (pedidoId: string, nuevoEstado: string) => {
    setCambiosPendientes(prev => ({
      ...prev,
      [pedidoId]: nuevoEstado
    }))
  }

  // Envía el cambio de estado al server y notifica al cliente
  const guardarCambioEstado = async (pedidoId: string) => {
    const nuevoEstado = cambiosPendientes[pedidoId]
    
    if (!nuevoEstado) {
      toast({
        title: "Sin cambios",
        description: "No hay cambios pendientes para guardar",
        variant: "default"
      })
      return
    }

    setGuardando(prev => ({ ...prev, [pedidoId]: true }))

    try {
      const response = await fetch(`/api/admin/pedidos/${pedidoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: nuevoEstado })
      })

      if (!response.ok) {
        throw new Error('Error al actualizar estado')
      }

      toast({
        title: "Estado actualizado",
        description: `El pedido ahora está en estado: ${nuevoEstado}`,
      })

      setPedidos(pedidos.map(p => 
        p._id === pedidoId ? { ...p, estado: nuevoEstado } : p
      ))

      // Limpia el cambio pendiente después de guardar
      setCambiosPendientes(prev => {
        const { [pedidoId]: _, ...rest } = prev
        return rest
      })

      setPedidoExpandido(null)

    } catch (error) {
      console.error("Error al cambiar estado:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del pedido",
        variant: "destructive"
      })
    } finally {
      setGuardando(prev => ({ ...prev, [pedidoId]: false }))
    }
  }

  // Cancela el cambio temporal sin guardarlo
  const cancelarCambio = (pedidoId: string) => {
    setCambiosPendientes(prev => {
      const { [pedidoId]: _, ...rest } = prev
      return rest
    })
  }

  // Funcion que filtra pedidos por estado y búsqueda
  const pedidosFiltrados = pedidos.filter(p => {
    const pasaFiltroEstado = filtroEstado === "todos" || p.estado === filtroEstado
    
    const nombreCliente = (p.userName || '').toLowerCase()
    const emailCliente = (p.userEmail || '').toLowerCase()
    const numeroPedido = (p.numeroPedido || '').toLowerCase()
    const busqueda = filtroCliente.toLowerCase()
    
    const pasaFiltroCliente = filtroCliente === "" || 
      nombreCliente.includes(busqueda) || 
      emailCliente.includes(busqueda) ||
      numeroPedido.includes(busqueda)
    
    return pasaFiltroEstado && pasaFiltroCliente
  })

  // Asigna color al badge según el estado
  const obtenerColorEstado = (estado: string) => {
    const colores: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "pendiente": "secondary",
      "pagado": "default",
      "en preparación": "default",
      "enviado": "default",
      "entregado": "outline",
      "cancelado": "destructive"
    }
    return colores[estado] || "default"
  }

  // Formatea la fecha en español
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

  // Expande o contrae los detalles del pedido
  const toggleExpandir = (pedidoId: string) => {
    setPedidoExpandido(pedidoExpandido === pedidoId ? null : pedidoId)
  }

  // Limpia todos los filtros aplicados
  const limpiarFiltros = () => {
    setFiltroEstado("todos")
    setFiltroCliente("")
  }

  if (cargando) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Cargando panel de administración...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="pt-24 pb-12 md:pt-28 md:pb-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-center">
              Panel de Administración
            </h1>
            <p className="text-center text-muted-foreground mt-2">
              Gestión de todos los pedidos
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="mb-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                {/* Filtro por estado */}
                <div className="flex gap-2 items-center">
                  <span className="text-sm font-semibold whitespace-nowrap">Filtrar por estado:</span>
                  <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos ({pedidos.length})</SelectItem>
                      <SelectItem value="pendiente">
                        Pendiente ({pedidos.filter(p => p.estado === 'pendiente').length})
                      </SelectItem>
                      <SelectItem value="pagado">
                        Pagado ({pedidos.filter(p => p.estado === 'pagado').length})
                      </SelectItem>
                      <SelectItem value="en preparación">
                        En preparación ({pedidos.filter(p => p.estado === 'en preparación').length})
                      </SelectItem>
                      <SelectItem value="enviado">
                        Enviado ({pedidos.filter(p => p.estado === 'enviado').length})
                      </SelectItem>
                      <SelectItem value="entregado">
                        Entregado ({pedidos.filter(p => p.estado === 'entregado').length})
                      </SelectItem>
                      <SelectItem value="cancelado">
                        Cancelado ({pedidos.filter(p => p.estado === 'cancelado').length})
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Búsqueda por cliente, email o número de pedido */}
                <div className="flex gap-2 items-center flex-1 w-full md:w-auto">
                  <span className="text-sm font-semibold whitespace-nowrap">Buscar:</span>
                  <div className="relative flex-1 md:w-[300px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Cliente, email o # pedido..."
                      value={filtroCliente}
                      onChange={(e) => setFiltroCliente(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {(filtroEstado !== "todos" || filtroCliente !== "") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={limpiarFiltros}
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>

              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <div>
                  Mostrando {pedidosFiltrados.length} de {pedidos.length} pedidos
                  {(filtroEstado !== "todos" || filtroCliente !== "") && (
                    <span className="ml-2 text-primary font-medium">
                      (filtrado)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {pedidosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="font-serif text-2xl font-bold mb-2">No hay pedidos</h2>
                <p className="text-muted-foreground">
                  {filtroEstado === "todos" && filtroCliente === ""
                    ? "No hay ningún pedido registrado" 
                    : "No se encontraron pedidos con los filtros aplicados"}
                </p>
                {(filtroEstado !== "todos" || filtroCliente !== "") && (
                  <Button
                    variant="outline"
                    onClick={limpiarFiltros}
                    className="mt-4"
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {pedidosFiltrados.map((pedido) => {
                  const tieneCambiosPendientes = cambiosPendientes[pedido._id] !== undefined
                  const estadoMostrado = cambiosPendientes[pedido._id] || pedido.estado
                  
                  return (
                    <Card key={pedido._id} className="overflow-hidden">
                      <CardHeader className="bg-muted/30">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <CardTitle className="text-lg">
                                Pedido #{pedido.numeroPedido}
                              </CardTitle>
                              <Badge variant={obtenerColorEstado(estadoMostrado)}>
                                {estadoMostrado.charAt(0).toUpperCase() + estadoMostrado.slice(1)}
                              </Badge>
                              {tieneCambiosPendientes && (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                                  Sin guardar
                                </Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleExpandir(pedido._id)}
                              >
                                {pedidoExpandido === pedido._id ? (
                                  <>
                                    <ChevronUp className="h-4 w-4 mr-1" />
                                    Ocultar
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="h-4 w-4 mr-1" />
                                    Ver detalles
                                  </>
                                )}
                              </Button>
                            </div>
                            
                            {/* Información básica del pedido */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span>Cliente: {pedido.userName}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <span>Correo: {pedido.userEmail}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Fecha Pedido: {formatearFecha(pedido.fechaPedido)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-2xl font-bold">₡{pedido.total.toLocaleString()}</p>
                          </div>
                        </div>
                      </CardHeader>

                      {pedidoExpandido === pedido._id && (
                        <CardContent className="space-y-4 pt-6">
                          {/* Selector de estado */}
                          <div className="flex items-center gap-3 pb-4 border-b flex-wrap">
                            <span className="font-semibold">Cambiar estado:</span>
                            <Select
                              value={estadoMostrado}
                              onValueChange={(valor) => registrarCambioEstado(pedido._id, valor)}
                            >
                              <SelectTrigger className="w-[200px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pendiente">Pendiente</SelectItem>
                                <SelectItem value="pagado">Pagado</SelectItem>
                                <SelectItem value="en preparación">En preparación</SelectItem>
                                <SelectItem value="enviado">Enviado</SelectItem>
                                <SelectItem value="entregado">Entregado</SelectItem>
                                <SelectItem value="cancelado">Cancelado</SelectItem>
                              </SelectContent>
                            </Select>

                            {tieneCambiosPendientes && (
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => guardarCambioEstado(pedido._id)}
                                  disabled={guardando[pedido._id]}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Save className="h-4 w-4 mr-1" />
                                  {guardando[pedido._id] ? "Guardando..." : "Guardar cambios"}
                                </Button>
                                <Button
                                  onClick={() => cancelarCambio(pedido._id)}
                                  disabled={guardando[pedido._id]}
                                  variant="outline"
                                  size="sm"
                                >
                                  Cancelar
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Datos de contacto */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b">
                            {pedido.direccionEnvio && (
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-semibold text-sm">Dirección:</span>
                                </div>
                                <p className="text-sm text-muted-foreground ml-6">
                                  {pedido.direccionEnvio}
                                </p>
                              </div>
                            )}
                            {pedido.telefonoContacto && (
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-semibold text-sm">Teléfono:</span>
                                </div>
                                <p className="text-sm text-muted-foreground ml-6">
                                  {pedido.telefonoContacto}
                                </p>
                              </div>
                            )}
                          </div>

                          {pedido.notasAdicionales && (
                            <div className="pb-4 border-b">
                              <p className="font-semibold text-sm mb-1">Notas del cliente:</p>
                              <p className="text-sm text-muted-foreground italic">
                                "{pedido.notasAdicionales}"
                              </p>
                            </div>
                          )}

                          {/* Productos del pedido */}
                          <div>
                            <p className="font-semibold mb-3">Productos del pedido:</p>
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
                                      <p className="text-sm text-muted-foreground">
                                        Color: {producto.color}
                                      </p>
                                    )}
                                    {producto.talla && (
                                      <p className="text-sm text-muted-foreground">
                                        Talla: {producto.talla}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold">
                                      ₡{producto.subtotal.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      ₡{producto.precio.toLocaleString()} c/u
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}