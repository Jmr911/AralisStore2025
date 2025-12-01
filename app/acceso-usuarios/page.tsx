"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-provider"
import { CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, register } = useAuth()
  
  // Estados del formulario
  const [activeTab, setActiveTab] = useState("login")
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState("")
  const [mostrarLoginPassword, setMostrarLoginPassword] = useState(false)
  const [mostrarRegisterPassword, setMostrarRegisterPassword] = useState(false)
  const [erroresValidacion, setErroresValidacion] = useState<string[]>([])

  // Detectar si viene de una sesión expirada
  useEffect(() => {
    const errorParam = searchParams.get("error")
    const messageParam = searchParams.get("message")
    
    if (errorParam === "SessionExpired") {
      const message = messageParam || "Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente."
      setSessionExpiredMessage(message)
      
      setTimeout(() => setSessionExpiredMessage(""), 10000)
    }
  }, [searchParams])

  // Validar contraseña mientras el usuario escribe
  useEffect(() => {
    if (!registerData.password) {
      setErroresValidacion([])
      return
    }

    const errores: string[] = []

    if (registerData.password.length < 8) {
      errores.push('Mínimo 8 caracteres')
    }
    if (!/[A-Z]/.test(registerData.password)) {
      errores.push('Al menos una letra mayúscula')
    }
    if (!/[a-z]/.test(registerData.password)) {
      errores.push('Al menos una letra minúscula')
    }
    if (!/[0-9]/.test(registerData.password)) {
      errores.push('Al menos un número')
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(registerData.password)) {
      errores.push('Al menos un carácter especial (!@#$%^&*...)')
    }

    setErroresValidacion(errores)
  }, [registerData.password])

  // Calcular nivel de seguridad de la contraseña
  const calcularFortaleza = (): { nivel: number; texto: string; color: string } => {
    if (!registerData.password) return { nivel: 0, texto: '', color: 'bg-muted' }

    let puntos = 0
    if (registerData.password.length >= 8) puntos++
    if (registerData.password.length >= 12) puntos++
    if (/[A-Z]/.test(registerData.password)) puntos++
    if (/[a-z]/.test(registerData.password)) puntos++
    if (/[0-9]/.test(registerData.password)) puntos++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(registerData.password)) puntos++

    if (puntos <= 2) return { nivel: 33, texto: 'Débil', color: 'bg-destructive' }
    if (puntos <= 4) return { nivel: 66, texto: 'Media', color: 'bg-yellow-500' }
    return { nivel: 100, texto: 'Fuerte', color: 'bg-green-500' }
  }

  const fortaleza = calcularFortaleza()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccessMessage("")
    setSessionExpiredMessage("")

    try {
      await login(loginData.email, loginData.password)
      setSuccessMessage("Inicio de sesión exitoso")
      setLoginData({ email: "", password: "" })

      setTimeout(() => {
        router.push("/")
        router.refresh()
      }, 1000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccessMessage("")
    setSessionExpiredMessage("")

    if (erroresValidacion.length > 0) {
      setError('Por favor, cumple con todos los requisitos de contraseña')
      setLoading(false)
      return
    }

    try {
      await register(registerData.name, registerData.email, registerData.password)
      setSuccessMessage("Cuenta creada correctamente. Ahora puedes iniciar sesión.")

      const registeredEmail = registerData.email
      setRegisterData({ name: "", email: "", password: "" })

      // Cambiar a login con el email ya lleno
      setTimeout(() => {
        setSuccessMessage("")
        setLoginData({ email: registeredEmail, password: "" })
        setActiveTab("login")
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md space-y-4">
          {/* Banner de sesión expirada */}
          {sessionExpiredMessage && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Sesión Expirada
                  </h3>
                  <p className="mt-1 text-sm text-red-700">
                    {sessionExpiredMessage}
                  </p>
                </div>
                <button
                  onClick={() => setSessionExpiredMessage("")}
                  className="ml-auto flex-shrink-0 text-red-400 hover:text-red-600"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <Card className="w-full">
            <CardHeader>
              <CardTitle className="font-serif text-3xl text-center">
                Bienvenido
              </CardTitle>
              <CardDescription className="text-center">
                Ingresa a tu cuenta o crea una nueva
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Ingresar</TabsTrigger>
                  <TabsTrigger value="register">Registrarse</TabsTrigger>
                </TabsList>

                {/* Tab de inicio de sesión */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Correo electrónico</Label>
                      <Input
                        id="login-email"
                        type="email"
                        required
                        value={loginData.email}
                        onChange={(e) =>
                          setLoginData({ ...loginData, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={mostrarLoginPassword ? 'text' : 'password'}
                          required
                          value={loginData.password}
                          onChange={(e) =>
                            setLoginData({
                              ...loginData,
                              password: e.target.value,
                            })
                          }
                          placeholder="Ingresa tu contraseña"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarLoginPassword(!mostrarLoginPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {mostrarLoginPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>

                    {error && <p className="text-red-600 text-sm">{error}</p>}
                    {successMessage && (
                      <p className="text-green-600 text-center font-medium">
                        {successMessage}
                      </p>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Ingresando..." : "Ingresar"}
                    </Button>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="text-sm text-amber-900 hover:underline"
                        onClick={() => router.push("/recuperar-contrasena")}
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                  </form>
                </TabsContent>

                {/* Tab de registro */}
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Nombre completo</Label>
                      <Input
                        id="register-name"
                        required
                        value={registerData.name}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Correo electrónico</Label>
                      <Input
                        id="register-email"
                        type="email"
                        required
                        value={registerData.email}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={mostrarRegisterPassword ? 'text' : 'password'}
                          required
                          value={registerData.password}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              password: e.target.value,
                            })
                          }
                          placeholder="Crea una contraseña segura"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarRegisterPassword(!mostrarRegisterPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {mostrarRegisterPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>

                      {/* Indicador de fortaleza */}
                      {registerData.password && (
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

                      {/* Mostrar requisitos pendientes */}
                      {registerData.password && erroresValidacion.length > 0 && (
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

                      {/* Checkmark cuando todo está bien */}
                      {registerData.password && erroresValidacion.length === 0 && (
                        <div className="flex items-center text-xs text-green-600 mt-2">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          <span>Todos los requisitos cumplidos</span>
                        </div>
                      )}
                    </div>

                    {error && <p className="text-red-600 text-sm">{error}</p>}
                    {successMessage && (
                      <p className="text-green-600 text-center font-medium">
                        {successMessage}
                      </p>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading || erroresValidacion.length > 0 || !registerData.password}
                    >
                      {loading ? "Creando cuenta..." : "Crear cuenta"}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      Usa al menos 8 caracteres con mayúsculas, minúsculas, números y símbolos
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}