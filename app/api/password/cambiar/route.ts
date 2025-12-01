import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcrypt'
import { enviarEmailConfirmacionCambio } from '@/lib/email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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
  console.log('POST /api/password/cambiar')
  console.log('Timestamp:', new Date().toISOString())
  console.log('============================================')
  
  try {
    const body = await request.json()
    const { email, currentPassword, newPassword } = body

    console.log('Solicitud de cambio de contraseña para:', email)

    // Verifica autenticación del usuario
    if (!email) {
      console.log('Email no proporcionado')
      return NextResponse.json(
        { error: 'No autorizado. Debes estar autenticado.' },
        { status: 401 }
      )
    }

    // Valida campos requeridos
    if (!currentPassword || !newPassword) {
      console.log('Faltan campos requeridos')
      return NextResponse.json(
        { error: 'Contraseña actual y nueva contraseña son requeridas' },
        { status: 400 }
      )
    }

    // Valida que la nueva contraseña cumpla requisitos de seguridad
    const validacion = validarContrasena(newPassword)
    if (!validacion.valida) {
      console.log('Nueva contraseña no cumple requisitos:', validacion.error)
      return NextResponse.json(
        { error: validacion.error },
        { status: 400 }
      )
    }
    console.log('Nueva contraseña cumple requisitos')

    // Verifica que las contraseñas sean diferentes
    if (currentPassword === newPassword) {
      console.log('Nueva contraseña es igual a la actual')
      return NextResponse.json(
        { error: 'La nueva contraseña debe ser diferente a la actual' },
        { status: 400 }
      )
    }

    // Conecta a la base de datos
    console.log('Conectando a MongoDB...')
    const client = await clientPromise
    const db = client.db()
    console.log('Conectado a MongoDB')

    // Busca el usuario en la base de datos
    console.log('Buscando usuario en BD...')
    const user = await db.collection('users').findOne({ 
      email: email 
    })
    
    if (!user) {
      console.log('Usuario no encontrado')
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    console.log('Usuario encontrado:', user.email)

    // Verifica que la contraseña actual sea correcta
    console.log('Verificando contraseña actual...')
    const passwordMatch = await bcrypt.compare(currentPassword, user.password)
    
    if (!passwordMatch) {
      console.log('Contraseña actual incorrecta')
      return NextResponse.json(
        { error: 'La contraseña actual es incorrecta' },
        { status: 400 }
      )
    }

    console.log('Contraseña actual verificada')

    // Verifica que la nueva contraseña sea diferente usando hash
    const mismContrasena = await bcrypt.compare(newPassword, user.password)
    
    if (mismContrasena) {
      console.log('Nueva contraseña es igual a la anterior (verificación hash)')
      return NextResponse.json(
        { error: 'La nueva contraseña debe ser diferente a la anterior' },
        { status: 400 }
      )
    }

    // Encripta la nueva contraseña
    console.log('Encriptando nueva contraseña...')
    const startEncrypt = Date.now()
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    const encryptTime = Date.now() - startEncrypt
    console.log(`Contraseña encriptada en ${encryptTime}ms`)

    // Actualiza la contraseña en la base de datos
    console.log('Actualizando contraseña en BD...')
    const updateResult = await db.collection('users').updateOne(
      { email: email },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date(),
          lastPasswordChange: new Date(),
          passwordChangedBy: 'user'
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

    // Envía email de confirmación al usuario
    console.log('Enviando email de confirmación...')
    try {
      await enviarEmailConfirmacionCambio(email, user.nombre)
      console.log('Email de confirmación enviado')
    } catch (emailError) {
      console.error('Error enviando email:', emailError)
    }

    // Registra el cambio en logs de auditoría
    try {
      await db.collection('audit_logs').insertOne({
        tipo: 'PASSWORD_CHANGE',
        email: email,
        userId: user._id,
        timestamp: new Date(),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metodo: 'cambio_autenticado'
      })
      console.log('Auditoría registrada')
    } catch (auditError) {
      console.error('Error en auditoría:', auditError)
    }

    console.log('============================================')
    console.log('Cambio de contraseña exitoso')
    console.log('Usuario:', email)
    console.log('============================================')

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    })

  } catch (error) {
    console.error('============================================')
    console.error('ERROR al cambiar contraseña')
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

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Endpoint de cambio de contraseña autenticado',
    method: 'POST',
    requiredFields: ['email', 'currentPassword', 'newPassword'],
    timestamp: new Date().toISOString()
  })
}