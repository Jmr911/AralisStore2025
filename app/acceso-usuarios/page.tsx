"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-provider"
import PasswordInput from "@/components/PasswordInput"
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

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, register } = useAuth()
  
  // Estados para controlar las pestañas y formularios
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

  // Verifica si hay parámetros de sesión expirada en la URL
  useEffect(() => {
    const errorParam = searchParams.get("error")
    const messageParam = searchParams.get("message")
    
    if (errorParam === "SessionExpired") {
      const message = messageParam || "Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente."
      setSessionExpiredMessage(message)
      
      // Auto-ocultar el mensaje después de 10 segundos
      setTimeout(() => setSessionExpiredMessage(""), 10000)
    }
  }, [searchParams])

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

      // Redirige al inicio después de login exitoso
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

    try {
      await register(registerData.name, registerData.email, registerData.password)
      setSuccessMessage("Cuenta creada correctamente. Ahora puedes iniciar sesión.")

      // Guarda el email para pre-llenarlo en el formulario de login
      const registeredEmail = registerData.email
      setRegisterData({ name: "", email: "", password: "" })

      // Cambia automáticamente a la pestaña de login
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
          {/* Alerta de sesión expirada */}
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

                {/* Formulario de inicio de sesión */}
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
                      <PasswordInput
                        id="login-password"
                        name="password"
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value,
                          })
                        }
                        required
                        placeholder="Ingresa tu contraseña"
                      />
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

                {/* Formulario de registro */}
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
                      <PasswordInput
                        id="register-password"
                        name="password"
                        value={registerData.password}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            password: e.target.value,
                          })
                        }
                        required
                        placeholder="Ingresa tu contraseña"
                      />
                    </div>

                    {error && <p className="text-red-600 text-sm">{error}</p>}
                    {successMessage && (
                      <p className="text-green-600 text-center font-medium">
                        {successMessage}
                      </p>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Creando cuenta..." : "Crear cuenta"}
                    </Button>
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