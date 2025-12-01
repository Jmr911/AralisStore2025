'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, CheckCircle2, XCircle, ArrowLeft, Loader2 } from 'lucide-react'

export default function CambiarContrasena() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mostrarActual, setMostrarActual] = useState(false)
  const [mostrarNueva, setMostrarNueva] = useState(false)
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false)
  
  const [estado, setEstado] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [erroresValidacion, setErroresValidacion] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirige a login si no hay usuario autenticado
  useEffect(() => {
    if (mounted && !user) {
      router.push('/acceso-usuarios')
    }
  }, [mounted, user, router])

  // Valida la nueva contraseña en tiempo real
  useEffect(() => {
    if (!newPassword) {
      setErroresValidacion([])
      return
    }

    const errores: string[] = []

    if (newPassword.length < 8) {
      errores.push('Mínimo 8 caracteres')
    }
    if (!/[A-Z]/.test(newPassword)) {
      errores.push('Al menos una letra mayúscula')
    }
    if (!/[a-z]/.test(newPassword)) {
      errores.push('Al menos una letra minúscula')
    }
    if (!/[0-9]/.test(newPassword)) {
      errores.push('Al menos un número')
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      errores.push('Al menos un carácter especial')
    }

    setErroresValidacion(errores)
  }, [newPassword])

  // Calcula la fortaleza de la contraseña
  const calcularFortaleza = (): { nivel: number; texto: string; color: string } => {
    if (!newPassword) return { nivel: 0, texto: '', color: 'bg-muted' }

    let puntos = 0
    if (newPassword.length >= 8) puntos++
    if (newPassword.length >= 12) puntos++
    if (/[A-Z]/.test(newPassword)) puntos++
    if (/[a-z]/.test(newPassword)) puntos++
    if (/[0-9]/.test(newPassword)) puntos++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) puntos++

    if (puntos <= 2) return { nivel: 33, texto: 'Débil', color: 'bg-destructive' }
    if (puntos <= 4) return { nivel: 66, texto: 'Media', color: 'bg-yellow-500' }
    return { nivel: 100, texto: 'Fuerte', color: 'bg-green-500' }
  }

  const fortaleza = calcularFortaleza()

  // Procesa el cambio de contraseña
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.email) {
      setError('No se pudo obtener tu información de usuario. Por favor, inicia sesión nuevamente.')
      return
    }
    
    if (erroresValidacion.length > 0) {
      setError('Por favor, cumple con todos los requisitos de contraseña')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden')
      return
    }

    if (currentPassword === newPassword) {
      setError('La nueva contraseña debe ser diferente a la actual')
      return
    }

    setError('')
    setMensaje('')
    setEstado('loading')

    try {
      const response = await fetch('/api/password/cambiar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          currentPassword,
          newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setEstado('success')
        setMensaje(data.message || 'Contraseña actualizada correctamente')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        
        setTimeout(() => {
          router.push('/')
        }, 3000)
      } else {
        setEstado('error')
        setError(data.error || 'Error al cambiar la contraseña')
      }
    } catch (err) {
      setEstado('error')
      setError('Error de conexión. Por favor, intenta nuevamente.')
      console.error('Error:', err)
    }
  }

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      {/* Encabezado con logo de Aralis */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-primary hover:underline mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Link>
        
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 relative flex-shrink-0">
            <Image
              src="/WhatsApp_Image_2025-10-07_at_11_22_18_AM__2_.jpeg"
              alt="Aralis - Confección a tu medida"
              width={80}
              height={80}
              className="object-contain"
              priority
            />
          </div>
          
          <div>
            <h1 className="text-2xl font-bold">Cambiar Contraseña</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Formulario principal */}
      <Card>
        <CardHeader>
          <CardTitle>Actualizar contraseña</CardTitle>
          <CardDescription>
            Asegúrate de usar una contraseña segura que no uses en otros sitios
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {estado === 'success' ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800 ml-2">
                <div className="font-medium">¡Contraseña actualizada!</div>
                <div className="text-sm mt-1">{mensaje}</div>
                <div className="text-xs mt-2 text-green-600">Redirigiendo al inicio...</div>
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {estado === 'error' && error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription className="ml-2">{error}</AlertDescription>
                </Alert>
              )}

              {/* Campo de contraseña actual */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña actual</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={mostrarActual ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={estado === 'loading'}
                    placeholder="Ingresa tu contraseña actual"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarActual(!mostrarActual)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {mostrarActual ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* Campo de nueva contraseña */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva contraseña</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={mostrarNueva ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={estado === 'loading'}
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

                {/* Indicador de fortaleza de contraseña */}
                {newPassword && (
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

                {/* Lista de requisitos faltantes */}
                {newPassword && erroresValidacion.length > 0 && (
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
              </div>

              {/* Campo de confirmación de contraseña */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={mostrarConfirmar ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={estado === 'loading'}
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

                {/* Indicador de coincidencia de contraseñas */}
                {confirmPassword && (
                  <div className="flex items-center text-xs mt-2">
                    {newPassword === confirmPassword ? (
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
                  estado === 'loading' ||
                  erroresValidacion.length > 0 ||
                  newPassword !== confirmPassword ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
              >
                {estado === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  'Cambiar contraseña'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Consejos de seguridad */}
      {estado !== 'success' && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Consejos de seguridad</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Usa una contraseña única que no uses en otros sitios</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>No compartas tu contraseña con nadie</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Cambia tu contraseña regularmente</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}