"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Mail, MessageCircle, CheckCircle } from "lucide-react"
import { DecorativeDivider } from "@/components/Division-decorativa"

export default function ContactoPage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  })

  // Guarda el formulario en MongoDB y redirige a WhatsApp
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Guarda el mensaje en la base de datos
      const res = await fetch("/api/guardar-formulario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_del_cliente: formData.name,
          correo_del_cliente: formData.email || "",
          telefono_del_cliente: formData.phone,
          mensaje_del_cliente: formData.message
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "No se pudo guardar el formulario")
      }

      const data = await res.json()
      console.log("Formulario guardado:", data)

      // Construye el mensaje para WhatsApp
      const whatsappMessage = `Hola, mi nombre es ${formData.name}.\n\n${formData.message}` +
        (formData.email ? `\n\nDatos de contacto:\n- Email: ${formData.email}` : "") +
        (formData.phone ? `\n- Teléfono: ${formData.phone}` : "")

      const whatsappNumber = "50683195781"
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
      window.open(whatsappUrl, "_blank")

      // Muestra confirmación y limpia el formulario
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setFormData({ name: "", email: "", phone: "", message: "" })
      }, 3000)

    } catch (error) {
      console.error("Error al guardar formulario:", error)
      alert("Ocurrió un error al enviar tu mensaje. Por favor intenta de nuevo.")
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">

        {/* Sección sobre nosotros */}
        <section className="pt-20 pb-12 md:pt-24 md:pb-16 bg-secondary/20">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">Sobre nosotros</h1>
            <p className="text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed text-base md:text-lg">
              Aralis es una microempresa dedicada a la confección personalizada de prendas de vestir en Tacacori, Alajuela. Combinamos tradición artesanal con técnicas modernas para crear piezas únicas que reflejan tu estilo.
            </p>
            <div className="relative w-full max-w-2xl aspect-video mx-auto rounded-lg overflow-hidden shadow-lg">
              <img src="/casa-artesanal-taller-confeccion.jpg" alt="Nuestra ubicación" className="w-full h-full object-cover" />
            </div>
          </div>
        </section>

        <DecorativeDivider />

        {/* Encabezado de contacto */}
        <section className="py-12 md:py-16 bg-secondary/30 text-center">
          <div className="container mx-auto px-4">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">Contáctanos</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Estamos aquí para responder tus preguntas y ayudarte con tu proyecto
            </p>
          </div>
        </section>

        {/* Formulario y datos de contacto */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-8">

              {/* Información de contacto */}
              <div>
                <h2 className="font-serif text-3xl font-bold mb-6">Información de contacto</h2>

                <div className="space-y-6 mb-8">
                  <div className="flex gap-4">
                    <a href="https://maps.app.goo.gl/DZgQiJNQQu5jTSWo9" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 hover:opacity-80 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                    </a>
                    <div>
                      <h3 className="font-semibold mb-1">Ubicación</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">Tacacori, Alajuela<br />Costa Rica</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <a href="tel:+50683195781" className="flex-shrink-0 hover:opacity-80 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                    </a>
                    <div>
                      <h3 className="font-semibold mb-1">Teléfono</h3>
                      <p className="text-muted-foreground text-sm">+506 8319-5781</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <a href="mailto:AralisModa@hotmail.com" className="flex-shrink-0 hover:opacity-80 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                    </a>
                    <div>
                      <h3 className="font-semibold mb-1">Correo electrónico</h3>
                      <p className="text-muted-foreground text-sm">AralisModa@hotmail.com</p>
                    </div>
                  </div>
                </div>

                <Card className="bg-primary text-primary-foreground">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <MessageCircle className="h-6 w-6 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold mb-2">Consulta por WhatsApp</h3>
                        <p className="text-sm opacity-90 mb-4 leading-relaxed">¿Tienes una pregunta rápida? Escríbenos directamente por WhatsApp</p>
                        <Button asChild variant="secondary" size="sm">
                          <a href={`https://wa.me/50683195781?text=${encodeURIComponent("Hola, me gustaría obtener más información sobre sus servicios de confección.")}`} target="_blank" rel="noopener noreferrer">
                            Abrir WhatsApp
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Formulario de contacto */}
              <div>
                <Card>
                  <CardContent className="p-6">
                    {submitted ? (
                      <div className="text-center py-8">
                        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                        <h3 className="font-serif text-2xl font-bold mb-2">¡Redirigiendo a WhatsApp!</h3>
                        <p className="text-muted-foreground leading-relaxed">Se abrirá WhatsApp con tu mensaje prellenado.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                          <h2 className="font-serif text-2xl font-bold mb-2">Envíanos un mensaje</h2>
                          <p className="text-sm text-muted-foreground">Completa el formulario y te contactaremos por WhatsApp</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contact-name">Nombre *</Label>
                          <Input
                            id="contact-name"
                            value={formData.name}
                            placeholder="Indique su nombre completo"
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contact-email">Correo electrónico (Opcional)</Label>
                          <Input
                            id="contact-email"
                            type="email"
                            value={formData.email}
                            placeholder="Coloque aquí su correo electrónico"
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contact-phone">Teléfono</Label>
                          <Input
                            id="contact-phone"
                            type="tel"
                            value={formData.phone}
                            placeholder="Solo números"
                            onChange={e => {
                              const numericValue = e.target.value.replace(/\D/g, "")
                              setFormData({ ...formData, phone: numericValue })
                            }}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contact-message">Mensaje *</Label>
                          <Textarea
                            id="contact-message"
                            placeholder="¿En qué podemos ayudarte?"
                            rows={5}
                            value={formData.message}
                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                            required
                          />
                        </div>

                        <Button type="submit" className="w-full">Enviar por WhatsApp</Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        </section>

        <DecorativeDivider />
      </main>
      <Footer />
    </div>
  )
}