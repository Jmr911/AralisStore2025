"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState("")
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/password/recuperar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setEnviado(true)
      } else {
        setError(data.error || "Error al enviar el correo")
      }
    } catch (err) {
      setError("Error al procesar la solicitud")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-serif">
              Recuperar contraseña
            </CardTitle>
            <CardDescription className="text-center">
              Ingresa tu correo y te enviaremos instrucciones para restablecerla
            </CardDescription>
          </CardHeader>
          <CardContent>
            {enviado ? (
              <div className="text-center space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-600 font-medium">✅ ¡Correo enviado!</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Si el email existe en nuestro sistema, recibirás un enlace de recuperación.
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Revisa tu bandeja de entrada (y spam) para continuar.
                </p>
                <Button onClick={() => router.push("/acceso-usuarios")} className="w-full">
                  Volver al inicio de sesión
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    disabled={loading}
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 text-center">{error}</p>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar instrucciones"
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => router.push("/acceso-usuarios")}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Volver al inicio de sesión
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}