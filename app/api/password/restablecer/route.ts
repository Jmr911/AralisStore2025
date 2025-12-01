import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcrypt'
import { enviarEmailConfirmacionCambio } from '@/lib/email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Valida que la contraseña cumpla con los requisitos de seguridad
function validarContrasena(password: string): { valida: boolean; error?: string } {
  if (password.length < 8) {
    return { 
      valida: false, 
      error: 'La contraseña debe tener al menos 8 caracteres' 
    }
  }
  
  if (!/[A-Z]/.test(password)) {
    return { 
      valida: false, 
      error: 'La contraseña debe contener al menos una letra mayúscula' 
    }
  }
  
  if (!/[a-z]/.test(password)) {
    return { 
      valida: false, 
      error: 'La contraseña debe contener al menos una letra minúscula' 
    }
  }
  
  if (!/[0-9]/.test(password)) {
    return { 
      valida: false, 
      error: 'La contraseña debe contener al menos un número' 
    }
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { 
      valida: false, 
      error: 'La contraseña debe contener al menos un carácter especial (!@#$%^&*...)' 
    }
  }

  return { valida: true }
}

export async function POST(request: NextRequest) {
  console.log('============================================')
  console.log('POST /api/password/restablecer')
  console.log('Timestamp:', new Date().toISOString())
  console.log('============================================')
  
  try {
    const body = await request.json()
    const { token, password } = body

    console.log('Token recibido:', token ? token.substring(0, 10) + '...' : 'NO PROPORCIONADO')

    // Valida campos requeridos
    if (!token || !password) {
      console.log('Faltan campos requeridos')
      return NextResponse.json(
        { error: 'Token y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Valida que la nueva contraseña cumpla requisitos de seguridad
    const validacion = validarContrasena(password)
    if (!validacion.valida) {
      console.log('Nueva contraseña no cumple requisitos:', validacion.error)
      return NextResponse.json(
        { error: validacion.error },
        { status: 400 }
      )
    }
    console.log('Nueva contraseña cumple requisitos de seguridad')

    // Conecta a la base de datos
    console.log('Conectando a MongoDB...')
    const client = await clientPromise
    const db = client.db()
    console.log('Conectado a MongoDB')

    // Busca y valida el token de recuperación
    console.log('Buscando token en BD...')
    const resetToken = await db.collection('password_resets').findOne({
      token,
      usado: false,
      expiracion: { $gt: new Date() }
    })

    if (!resetToken) {
      console.log('Token inválido, usado o expirado')
      
      // Verifica si el token existe pero está expirado o usado
      const expiredToken = await db.collection('password_resets').findOne({ token })
      
      if (expiredToken) {
        if (expiredToken.usado) {
          console.log('Token ya fue usado')
          return NextResponse.json(
            { error: 'Este enlace ya fue utilizado. Solicita uno nuevo.' },
            { status: 400 }
          )
        }
        if (expiredToken.expiracion < new Date()) {
          console.log('Token expirado')
          return NextResponse.json(
            { error: 'Este enlace ha expirado. Solicita uno nuevo.' },
            { status: 400 }
          )
        }
      }
      
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 400 }
      )
    }

    console.log('Token válido encontrado')
    console.log('Email asociado:', resetToken.email)

    // Verifica que el usuario existe en la base de datos
    console.log('Buscando usuario en BD...')
    const user = await db.collection('users').findOne({ email: resetToken.email })
    
    if (!user) {
      console.log('Usuario no encontrado')
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    console.log('Usuario encontrado:', user.email)

    // Verifica que la nueva contraseña sea diferente a la anterior
    console.log('Verificando que la nueva contraseña sea diferente...')
    const mismContrasena = await bcrypt.compare(password, user.password)
    
    if (mismContrasena) {
      console.log('Nueva contraseña es igual a la anterior')
      return NextResponse.json(
        { error: 'La nueva contraseña debe ser diferente a la anterior' },
        { status: 400 }
      )
    }
    console.log('Nueva contraseña es diferente a la anterior')

    // Encripta la nueva contraseña
    console.log('Encriptando nueva contraseña...')
    const startEncrypt = Date.now()
    const hashedPassword = await bcrypt.hash(password, 12)
    const encryptTime = Date.now() - startEncrypt
    console.log(`Contraseña encriptada en ${encryptTime}ms`)

    // Actualiza la contraseña en la base de datos
    console.log('Actualizando contraseña en BD...')
    const updateResult = await db.collection('users').updateOne(
      { email: resetToken.email },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date(),
          lastPasswordChange: new Date(),
          passwordChangedBy: 'password_reset'
        } 
      }
    )

    if (updateResult.modifiedCount === 0) {
      console.log('No se pudo actualizar la contraseña')
      return NextResponse.json(
        { error: 'Error al actualizar la contraseña' },
        { status: 500 }
      )
    }

    console.log('Contraseña actualizada en BD')

    // Marca el token como usado para evitar reutilización
    console.log('Marcando token como usado...')
    await db.collection('password_resets').updateOne(
      { token },
      { 
        $set: { 
          usado: true,
          usadoEn: new Date()
        } 
      }
    )
    console.log('Token marcado como usado')

    // Envía email de confirmación al usuario
    console.log('Enviando email de confirmación...')
    try {
      await enviarEmailConfirmacionCambio(resetToken.email, user.nombre)
      console.log('Email de confirmación enviado')
    } catch (emailError) {
      console.error('Error enviando email:', emailError)
    }

    // Registra el cambio en logs de auditoría
    try {
      await db.collection('audit_logs').insertOne({
        tipo: 'PASSWORD_RESET',
        email: resetToken.email,
        userId: user._id,
        timestamp: new Date(),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metodo: 'restablecer_por_token'
      })
      console.log('Auditoría registrada')
    } catch (auditError) {
      console.error('Error en auditoría:', auditError)
    }

    console.log('============================================')
    console.log('Restablecimiento de contraseña exitoso')
    console.log('Usuario:', resetToken.email)
    console.log('============================================')

    return NextResponse.json({
      message: 'Contraseña actualizada correctamente',
      success: true
    })

  } catch (error) {
    console.error('============================================')
    console.error('ERROR al restablecer contraseña')
    console.error('Error:', error)
    console.error('Stack:', error instanceof Error ? error.stack : 'N/A')
    console.error('============================================')
    
    return NextResponse.json(
      { 
        error: 'Error al procesar la solicitud',
        detalle: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  console.log('GET /api/password/restablecer - Verificación')
  return NextResponse.json({ 
    status: 'ok',
    message: 'Endpoint de restablecimiento de contraseña',
    method: 'POST',
    requiredFields: ['token', 'password'],
    passwordRequirements: {
      minLength: 8,
      uppercase: true,
      lowercase: true,
      number: true,
      specialChar: true
    },
    timestamp: new Date().toISOString()
  })
}