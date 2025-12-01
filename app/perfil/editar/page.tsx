'use client'

// Imports necesarios para la funcionalidad de la página
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

// Componentes de UI
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Iconos
import { CheckCircle2, XCircle, ArrowLeft, Loader2, User, Mail } from 'lucide-react'

export default function EditarPerfil() {
  // Obtenemos el usuario actual y la función para actualizarlo
  const { user, updateUser } = useAuth()
  const router = useRouter()
  
  // Estados para los campos del formulario
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [emailOriginal, setEmailOriginal] = useState('') // guardamos el email original para validar cambios
  
  // Estados para controlar el proceso de actualización
  const [estado, setEstado] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  // Esperamos a que el componente esté montado en el cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  // Si no hay usuario autenticado, redirigimos al login
  useEffect(() => {
    if (mounted && !user) {
      router.push('/acceso-usuarios')
    }
  }, [mounted, user, router])

  // Cuando carga el componente, precargamos los datos del usuario en los campos
  useEffect(() => {
    if (user) {
      setNombre(user.name || '')
      setEmail(user.email || '')
      setEmailOriginal(user.email || '') // guardamos el original para comparar después
    }
  }, [user])

  // Función para validar que el email tenga formato correcto
  const validarEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  // Función que se ejecuta cuando el usuario envía el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Verificamos que haya un usuario
    if (!user) {
      setError('No se pudo obtener tu información de usuario. Por favor, inicia sesión nuevamente.')
      return
    }

    // Validamos que el nombre no esté vacío
    if (!nombre.trim()) {
      setError('El nombre no puede estar vacío')
      return
    }

    // Validamos que el email no esté vacío
    if (!email.trim()) {
      setError('El correo no puede estar vacío')
      return
    }

    // Validamos el formato del email
    if (!validarEmail(email)) {
      setError('Por favor, ingresa un correo electrónico válido')
      return
    }

    // Si no hubo cambios, no hacemos nada
    if (nombre === user.name && email === emailOriginal) {
      setError('No se detectaron cambios en tu perfil')
      return
    }

    // Limpiamos mensajes anteriores y activamos el estado de carga
    setError('')
    setMensaje('')
    setEstado('loading')

    try {
      // Enviamos los datos al servidor para actualizar el perfil
      const response = await fetch('/api/profile/actualizar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailActual: emailOriginal,
          nuevoNombre: nombre,
          nuevoEmail: email,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Si todo salió bien, mostramos mensaje de éxito
        setEstado('success')
        setMensaje(data.message || 'Perfil actualizado correctamente')
        
        // Actualizamos los datos del usuario en el contexto de la app
        const nuevoUsuario = {
          ...user,
          name: nombre,
          email: email,
        }
        
        updateUser(nuevoUsuario)
        setEmailOriginal(email) // actualizamos el email original por si quiere hacer más cambios
        
        // Después de 3 segundos, redirigimos al inicio
        setTimeout(() => {
          router.push('/')
        }, 3000)
      } else {
        // Si hubo un error, lo mostramos
        setEstado('error')
        setError(data.error || 'Error al actualizar el perfil')
      }
    } catch (err) {
      // Si falla la conexión, mostramos un error
      setEstado('error')
      setError('Error de conexión. Por favor, intenta nuevamente.')
      console.error('Error:', err)
    }
  }

  // Mientras carga la página o verifica el usuario, mostramos un spinner
  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      {/* Header con logo y botón de volver */}
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
            <h1 className="text-2xl font-bold">Editar Perfil</h1>
            <p className="text-sm text-muted-foreground">Actualiza tu información personal</p>
          </div>
        </div>
      </div>

      {/* Card principal con el formulario */}
      <Card>
        <CardHeader>
          <CardTitle>Información personal</CardTitle>
          <CardDescription>
            Puedes actualizar tu nombre y correo electrónico
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {estado === 'success' ? (
            // Si se guardó exitosamente, mostramos este mensaje
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800 ml-2">
                <div className="font-medium">¡Perfil actualizado!</div>
                <div className="text-sm mt-1">{mensaje}</div>
                <div className="text-xs mt-2 text-green-600">Redirigiendo al inicio...</div>
              </AlertDescription>
            </Alert>
          ) : (
            // Si no se ha guardado, mostramos el formulario
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mensaje de error si algo salió mal */}
              {estado === 'error' && error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription className="ml-2">{error}</AlertDescription>
                </Alert>
              )}

              {/* Campo para editar el nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre completo</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="nombre"
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    disabled={estado === 'loading'}
                    placeholder="Tu nombre completo"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Campo para editar el email */}
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={estado === 'loading'}
                    placeholder="tu@email.com"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Si cambias tu correo, deberás usarlo para iniciar sesión
                </p>
              </div>

              {/* Botón para guardar los cambios */}
              <Button
                type="submit"
                className="w-full"
                disabled={estado === 'loading' || (!nombre.trim() || !email.trim())}
              >
                {estado === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Card con información adicional */}
      {estado !== 'success' && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Información importante</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Tu nombre aparecerá en tus pedidos y en el sistema</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>El correo es tu identificador único en Aralis</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  Si deseas cambiar tu contraseña, ve a{' '}
                  <Link href="/perfil/cambiar-contrasena" className="text-primary hover:underline">
                    Cambiar Contraseña
                  </Link>
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}