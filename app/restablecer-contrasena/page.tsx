"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Componente que maneja el formulario de reseteo
function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  // Estados para el formulario y validaciones
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [mostrarNueva, setMostrarNueva] = useState(false)
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [tokenValido, setTokenValido] = useState<boolean | null>(null)
  const [erroresValidacion, setErroresValidacion] = useState<string[]>([])

  // Verificamos si el token que viene en la URL es válido
  useEffect(() => {
    if (!token) {
      setTokenValido(false)
      setError("Token no válido o expirado")
      return
    }

    setTokenValido(true)
  }, [token])

  // Validamos la contraseña cada vez que el usuario escribe
  useEffect(() => {
    if (!password) {
      setErroresValidacion([])
      return
    }

    const errores: string[] = []

    if (password.length < 8) {
      errores.push('Mínimo 8 caracteres')
    }
    if (!/[A-Z]/.test(password)) {
      errores.push('Al menos una letra mayúscula')
    }
    if (!/[a-z]/.test(password)) {
      errores.push('Al menos una letra minúscula')
    }
    if (!/[0-9]/.test(password)) {
      errores.push('Al menos un número')
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errores.push('Al menos un carácter especial (!@#$%^&*...)')
    }

    setErroresValidacion(errores)
  }, [password])

  // Calculamos qué tan fuerte es la contraseña
  const calcularFortaleza = (): { nivel: number; texto: string; color: string } => {
    if (!password) return { nivel: 0, texto: '', color: 'bg-muted' }

    let puntos = 0
    if (password.length >= 8) puntos++
    if (password.length >= 12) puntos++
    if (/[A-Z]/.test(password)) puntos++
    if (/[a-z]/.test(password)) puntos++
    if (/[0-9]/.test(password)) puntos++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) puntos++

    if (puntos <= 2) return { nivel: 33, texto: 'Débil', color: 'bg-destructive' }
    if (puntos <= 4) return { nivel: 66, texto: 'Media', color: 'bg-yellow-500' }
    return { nivel: 100, texto: 'Fuerte', color: 'bg-green-500' }
  }

  const fortaleza = calcularFortaleza()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Verificamos que la contraseña cumpla todos los requisitos
    if (erroresValidacion.length > 0) {
      setError('Por favor, cumple con todos los requisitos de contraseña')
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setLoading(true)

    try {
      // Enviamos la nueva contraseña al backend
      const response = await fetch("/api/password/restablecer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        // Después de 3 segundos redirigimos al login
        setTimeout(() => {
          router.push("/acceso-usuarios")
        }, 3000)
      } else {
        setError(data.error || "Error al cambiar la contraseña")
      }
    } catch (err) {
      setError("Error al procesar la solicitud")
    } finally {
      setLoading(false)
    }
  }

  // Si el token no es válido, mostramos pantalla de error
  if (tokenValido === false) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <XCircle className="h-16 w-16 mx-auto mb-4 text-red-600" />
              <h2 className="text-2xl font-bold mb-2">Token Inválido</h2>
              <p className="text-muted-foreground mb-6">
                El enlace de recuperación no es válido o ha expirado.
              </p>
              <Button onClick={() => router.push("/recuperar-contrasena")} className="w-full">
                Solicitar nuevo enlace
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  // Si todo salió bien, mostramos mensaje de éxito
  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-600" />
              <h2 className="text-2xl font-bold mb-2">¡Contraseña Actualizada!</h2>
              <p className="text-muted-foreground mb-6">
                Tu contraseña ha sido cambiada exitosamente.
              </p>
              <p className="text-sm text-muted-foreground">
                Redirigiendo al inicio de sesión...
              </p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  // Formulario principal para cambiar la contraseña
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-serif">
              Nueva Contraseña
            </CardTitle>
            <CardDescription className="text-center">
              Crea una contraseña segura para tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mostramos mensajes de error si los hay */}
              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription className="ml-2">{error}</AlertDescription>
                </Alert>
              )}

              {/* Campo para la nueva contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password">Nueva contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={mostrarNueva ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    placeholder="Ingresa tu nueva contraseña"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarNueva(!mostrarNueva)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {mostrarNueva ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>

                {/* Barra que muestra qué tan fuerte es la contraseña */}
                {password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Fortaleza:</span>
                      <span className={`font-medium ${
                        fortaleza.nivel === 33 ? 'text-red-600' : 
                        fortaleza.nivel === 66 ? 'text-yellow-600' : 
                        'text-green-600'
                      }`}>
                        {fortaleza.texto}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${fortaleza.color}`}
                        style={{ width: `${fortaleza.nivel}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Lista de requisitos que faltan cumplir */}
                {password && erroresValidacion.length > 0 && (
                  <div className="space-y-1 mt-2">
                    <p className="text-xs font-medium text-muted-foreground">Requisitos faltantes:</p>
                    {erroresValidacion.map((error, index) => (
                      <div key={index} className="flex items-center text-xs text-destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        {error}
                      </div>
                    ))}
                  </div>
                )}

                {/* Mensaje cuando todos los requisitos se cumplen */}
                {password && erroresValidacion.length === 0 && (
                  <div className="flex items-center text-xs text-green-600 mt-2">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    <span>Todos los requisitos cumplidos</span>
                  </div>
                )}
              </div>

              {/* Campo para confirmar la contraseña */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={mostrarConfirmar ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    placeholder="Confirma tu nueva contraseña"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {mostrarConfirmar ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>

                {/* Indicador de si las contraseñas coinciden */}
                {confirmPassword && (
                  <div className="flex items-center text-xs mt-2">
                    {password === confirmPassword ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-green-600 mr-1" />
                        <span className="text-green-600">Las contraseñas coinciden</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 text-destructive mr-1" />
                        <span className="text-destructive">Las contraseñas no coinciden</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={
                  loading ||
                  erroresValidacion.length > 0 ||
                  password !== confirmPassword ||
                  !password ||
                  !confirmPassword
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  "Cambiar contraseña"
                )}
              </Button>
            </form>

            {/* Caja con los requisitos de contraseña */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Requisitos de contraseña:
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Mínimo 8 caracteres</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Al menos una letra mayúscula (A-Z)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Al menos una letra minúscula (a-z)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Al menos un número (0-9)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Al menos un carácter especial (!@#$%...)</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

// Componente principal - necesitamos Suspense porque usamos useSearchParams
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}