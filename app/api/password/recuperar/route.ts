import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { enviarEmailRecuperacion } from '@/lib/email'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  console.log('============================================')
  console.log('POST /api/auth/olvide-contrasena')
  console.log('============================================')
  
  try {
    const body = await request.json()
    const { email } = body

    console.log('Email recibido:', email)

    // Valida que el email esté presente
    if (!email) {
      console.log('Email no proporcionado')
      return NextResponse.json(
        { error: 'El email es requerido' },
        { status: 400 }
      )
    }

    // Valida formato del email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('Formato de email inválido')
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      )
    }

    console.log('Conectando a MongoDB...')
    const client = await clientPromise
    const db = client.db()
    console.log('Conectado a MongoDB')

    // Busca el usuario en la base de datos
    console.log('Buscando usuario...')
    const user = await db.collection('users').findOne({ email })

    if (!user) {
      console.log('Usuario no encontrado, pero respondemos genéricamente por seguridad')
      // Por seguridad, no revelamos si el email existe o no
      return NextResponse.json({
        message: 'Si el email está registrado, recibirás un enlace de recuperación',
        success: true
      })
    }

    console.log('Usuario encontrado:', user.email)

    // Genera token único de recuperación
    const token = crypto.randomBytes(32).toString('hex')
    const expiracion = new Date(Date.now() + 3600000) // 1 hora

    console.log('Token generado:', token.substring(0, 10) + '...')
    console.log('Expira en:', expiracion.toLocaleString())

    // Elimina tokens anteriores del mismo email
    const deleteResult = await db.collection('password_resets').deleteMany({ email })
    console.log('Tokens antiguos eliminados:', deleteResult.deletedCount)

    // Guarda el token en la base de datos
    console.log('Guardando token en BD...')
    const insertResult = await db.collection('password_resets').insertOne({
      email,
      token,
      expiracion,
      usado: false,
      createdAt: new Date()
    })
    console.log('Token guardado con ID:', insertResult.insertedId)

    // Envía email con el enlace de recuperación
    console.log('Enviando email de recuperación...')
    const emailResult = await enviarEmailRecuperacion(email, token)

    if (emailResult.success) {
      console.log('Email enviado exitosamente')
      console.log('============================================')
      
      return NextResponse.json({
        message: 'Se ha enviado un correo con instrucciones para recuperar tu contraseña',
        success: true
      })
    } else {
      console.error('Error enviando email:', emailResult.error)
      
      return NextResponse.json(
        { 
          error: 'Error al enviar el email de recuperación',
          details: emailResult.error 
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('============================================')
    console.error('Error en olvide-contrasena:', error)
    console.error('Stack:', error instanceof Error ? error.stack : 'N/A')
    console.error('============================================')
    
    return NextResponse.json(
      { 
        error: 'Error al procesar la solicitud',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  console.log('GET /api/auth/olvide-contrasena - Verificación')
  return NextResponse.json({ 
    status: 'ok',
    message: 'Endpoint de recuperación de contraseña',
    method: 'POST',
    requiredFields: ['email'],
    timestamp: new Date().toISOString()
  })
}