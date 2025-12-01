"use client"

import type React from "react"
import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, Image as ImageIcon } from "lucide-react"
import { DecorativeDivider } from "@/components/Division-decorativa"

// Componente interno que usa useSearchParams
function PersonalizarContent() {
  const searchParams = useSearchParams()
  const productoNombre = searchParams.get("producto")

  const [submitted, setSubmitted] = useState(false)
  const [wantsContact, setWantsContact] = useState(false)
  const [wantsToSendImages, setWantsToSendImages] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    garmentType: "",
    description: "",
    measurements: "",
    preferredTime: "",
  })

  // Guarda el formulario en MongoDB y redirige a WhatsApp
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const tipoPrenda = productoNombre ? productoNombre : formData.garmentType

    // Guarda la solicitud en la base de datos
    try {
      await fetch("/api/formularios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_del_cliente: formData.name,
          correo_del_cliente: formData.email || "",
          telefono_del_cliente: formData.phone,
          tipo_prenda: tipoPrenda,
          diseno_requerido_por_el_cliente: formData.description,
          medidas_del_cliente: formData.measurements,
          hora_preferida_por_el_cliente: formData.preferredTime,
          Cliente_adjunta_imagen_de_referencia: wantsToSendImages,
          fecha: new Date(),
        }),
      })
    } catch (error) {
      console.error("Error al guardar en MongoDB:", error)
    }

    // Construye el mensaje para WhatsApp
    let whatsappMessage = `Hola, mi nombre es ${formData.name} y quiero personalizar una prenda.

*Prenda:* ${tipoPrenda}

*Descripción del diseño requerido por el cliente:*
${formData.description}
${formData.measurements ? `

*Medidas:*
${formData.measurements}` : ""}

${wantsContact && formData.preferredTime ? `

URGENTE - Necesito ser contactado lo antes posible
*Hora preferida:* ${formData.preferredTime}` : ""}

${wantsToSendImages ? `

El cliente va a adjuntar imágenes de referencia` : ""}

*Datos de contacto:*
- Nombre: ${formData.name}
${formData.email ? `- Email: ${formData.email}` : ""}
- Teléfono: ${formData.phone}`

    const whatsappNumber = "50683195781"
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, "_blank")
    }

    // Muestra confirmación y limpia el formulario
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({
        name: "",
        email: "",
        phone: "",
        garmentType: "",
        description: "",
        measurements: "",
        preferredTime: "",
      })
      setWantsContact(false)
      setWantsToSendImages(false)
    }, 3000)
  }

  // Pantalla de confirmación
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <Card className="max-w-md mx-4">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="font-serif text-2xl font-bold mb-2">
                ¡Redirigiendo a WhatsApp!
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Se abrirá WhatsApp con tu solicitud prellenada. Recuerda enviar tus imágenes si las tienes.
              </p>
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
        {/* Encabezado de la página */}
        <section className="pt-16 pb-8 md:pt-24 md:pb-12 bg-secondary/30">
          <div className="container mx-auto px-4">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-center mb-4">
              Personaliza tu prenda
            </h1>
            {productoNombre ? (
              <p className="text-center text-lg font-medium text-primary">
                {productoNombre}
              </p>
            ) : (
              <p className="text-center text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Cuéntanos tu idea y trabajaremos juntos para crear la prenda perfecta para ti
              </p>
            )}
          </div>
        </section>

        <section className="pt-8 pb-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <form onSubmit={handleSubmit}>
              {/* Información de contacto */}
              <Card>
                <CardHeader>
                  <CardTitle>Información de contacto</CardTitle>
                  <CardDescription>
                    Completa tus datos para que podamos contactarte
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo *</Label>
                      <Input
                        id="name"
                        required
                        placeholder="Indique su nombre completo"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo electrónico (Opcional)</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Coloque aquí su correo electrónico"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      placeholder="Solo números"
                      value={formData.phone}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/\D/g, "")
                        setFormData({ ...formData, phone: numericValue })
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Detalles de la prenda */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Detalles de la prenda</CardTitle>
                  {productoNombre && (
                    <p className="text-base font-medium text-primary pt-1 text-center">
                      {productoNombre}
                    </p>
                  )}
                  <CardDescription>
                    {productoNombre
                      ? "Cuéntanos cómo deseas personalizar esta prenda"
                      : "Describe la prenda que deseas personalizar"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!productoNombre && (
                    <div className="space-y-2">
                      <Label htmlFor="garmentType">Tipo de prenda *</Label>
                      <Select
                        value={formData.garmentType}
                        onValueChange={(value) =>
                          setFormData({ ...formData, garmentType: value })
                        }
                        required={!productoNombre}
                      >
                        <SelectTrigger id="garmentType">
                          <SelectValue placeholder="Selecciona el tipo de prenda" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Camisa">Camisa</SelectItem>
                          <SelectItem value="Pantalon">Pantalón</SelectItem>
                          <SelectItem value="Vestido">Vestido</SelectItem>
                          <SelectItem value="Falda">Falda</SelectItem>
                          <SelectItem value="Blusa">Blusa</SelectItem>
                          <SelectItem value="Otros">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción del diseño *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe el estilo, colores, detalles especiales que deseas..."
                      rows={5}
                      required
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="measurements">Medidas</Label>
                    <Textarea
                      id="measurements"
                      placeholder="Si conoces tus medidas, indícalas aquí (Opcional)"
                      rows={3}
                      value={formData.measurements}
                      onChange={(e) =>
                        setFormData({ ...formData, measurements: e.target.value })
                      }
                    />
                  </div>

                  {/* Opción para adjuntar imágenes */}
                  <Card className="mt-2 border border-muted-foreground/20 shadow-none">
                    <CardContent className="py-1">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="wantsToSendImages"
                          checked={wantsToSendImages}
                          onCheckedChange={(checked) =>
                            setWantsToSendImages(checked as boolean)
                          }
                        />
                        <Label
                          htmlFor="wantsToSendImages"
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          El cliente va a adjuntar imágenes de referencia
                        </Label>
                      </div>
                      {wantsToSendImages && (
                        <div className="mt-1 px-2 py-1 border-2 border-primary/50 bg-primary/10 rounded-lg flex items-center justify-center space-x-1 animate-pulse">
                          <ImageIcon className="h-4 w-4 text-primary" />
                          <p className="text-xs font-semibold text-primary text-center m-0">
                            Favor enviarlas por WhatsApp a continuación después de llenar el formulario.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>

              {/* Opción de contacto urgente */}
              <Card className="mt-2 border border-muted-foreground/20 shadow-none">
                <CardContent className="py-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="wantsContact"
                      checked={wantsContact}
                      onCheckedChange={(checked) => setWantsContact(checked as boolean)}
                    />
                    <div>
                      <Label
                        htmlFor="wantsContact"
                        className="text-base font-medium leading-none cursor-pointer"
                      >
                        Ocupo ser contactado lo antes posible.
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Marca esta opción si la personalización es urgente y necesitas atención rápida.
                      </p>
                    </div>
                  </div>

                  {wantsContact && (
                    <div className="space-y-2 pl-7 mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <Label htmlFor="preferredTime">Indica la hora preferida de contacto *</Label>
                      <Input
                        id="preferredTime"
                        placeholder="Ejemplo: 9am - 2pm"
                        required={wantsContact}
                        value={formData.preferredTime}
                        onChange={(e) =>
                          setFormData({ ...formData, preferredTime: e.target.value })
                        }
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="mt-8 text-center">
                <button
                  type="submit"
                  className="px-8 py-3 font-medium rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-sm"
                >
                  Enviar por WhatsApp
                </button>
              </div>

              <DecorativeDivider />
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

// Componente principal que envuelve PersonalizarContent en Suspense
export default function PersonalizarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando formulario...</p>
        </div>
      </div>
    }>
      <PersonalizarContent />
    </Suspense>
  )
}