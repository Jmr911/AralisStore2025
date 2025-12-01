import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { enviarEmailCambioPerfil } from '@/lib/email'

export async function PUT(request: NextRequest) {
  try {
    console.log('============================================')
    console.log('Actualizando perfil de usuario')
    console.log('============================================')
    
    // Extraemos los datos que vienen del formulario
    const { emailActual, nuevoNombre, nuevoEmail } = await request.json()

    console.log('Email actual:', emailActual)
    console.log('Nuevo nombre:', nuevoNombre)
    console.log('Nuevo email:', nuevoEmail)

    // Nos aseguramos de que el usuario envió todos los campos necesarios
    if (!emailActual || !nuevoNombre || !nuevoEmail) {
      console.log('❌ Faltan campos requeridos')
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      )
    }

    // Validamos que el email tenga un formato correcto
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(nuevoEmail)) {
      console.log('❌ Email inválido:', nuevoEmail)
      return NextResponse.json(
        { error: 'El correo electrónico no es válido' },
        { status: 400 }
      )
    }

    // Nos conectamos a la base de datos
    const client = await clientPromise
    const db = client.db('aralis_db')
    const usersCollection = db.collection('users')

    console.log('Conectado a MongoDB')

    // Buscamos al usuario en la BD usando su email actual
    const user = await usersCollection.findOne({ email: emailActual })

    if (!user) {
      console.log('❌ Usuario no encontrado:', emailActual)
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    console.log('Usuario encontrado:', user.name)

    // Si el usuario está cambiando su email, verificamos que el nuevo no esté siendo usado por alguien más
    if (nuevoEmail !== emailActual) {
      const emailExiste = await usersCollection.findOne({ email: nuevoEmail })
      
      if (emailExiste) {
        console.log('❌ El nuevo email ya está en uso:', nuevoEmail)
        return NextResponse.json(
          { error: 'El correo electrónico ya está registrado' },
          { status: 409 }
        )
      }
    }

    // Guardamos los cambios en la base de datos
    const resultado = await usersCollection.updateOne(
      { email: emailActual },
      { 
        $set: { 
          name: nuevoNombre,
          email: nuevoEmail,
          updatedAt: new Date()
        } 
      }
    )

    // Verificamos que efectivamente se haya actualizado algo
    if (resultado.modifiedCount === 0) {
      console.log('⚠️ No se realizaron cambios en la BD')
      return NextResponse.json(
        { error: 'No se pudo actualizar el perfil' },
        { status: 500 }
      )
    }

    console.log('✅ Perfil actualizado exitosamente en la BD')

    // Le enviamos un email al usuario para que sepa que su perfil cambió
    console.log('Enviando email de confirmación de cambio de perfil...')
    try {
      await enviarEmailCambioPerfil(
        nuevoEmail, // mandamos el email al nuevo correo
        nuevoNombre,
        {
          nombreAnterior: user.name,
          nombreNuevo: nuevoNombre,
          emailAnterior: emailActual,
          emailNuevo: nuevoEmail
        }
      )
      console.log('✅ Email de confirmación de cambio de perfil enviado')
    } catch (emailError) {
      console.error('❌ Error enviando email:', emailError)
      // Si falla el email no pasa nada, el perfil ya se actualizó correctamente
    }

    // Registramos este cambio en los logs de auditoría para llevar un historial
    try {
      await db.collection('audit_logs').insertOne({
        tipo: 'PROFILE_UPDATE',
        emailAnterior: emailActual,
        emailNuevo: nuevoEmail,
        nombreNuevo: nuevoNombre,
        userId: user._id,
        timestamp: new Date(),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      })
      console.log('Auditoría registrada')
    } catch (auditError) {
      console.error('Error en auditoría:', auditError)
      // Tampoco interrumpimos si falla guardar el log
    }

    console.log('============================================')
    console.log('Actualización exitosa')
    console.log('Usuario:', nuevoNombre)
    console.log('Nuevo email:', nuevoEmail)
    console.log('============================================')

    // Le confirmamos al frontend que todo salió bien
    return NextResponse.json({
      success: true,
      message: 'Perfil actualizado correctamente'
    })

  } catch (error) {
    console.error('============================================')
    console.error('ERROR al actualizar perfil')
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

// Este método GET solo sirve para probar que la ruta existe y funciona
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Endpoint de actualización de perfil',
    method: 'PUT',
    requiredFields: ['emailActual', 'nuevoNombre', 'nuevoEmail'],
    timestamp: new Date().toISOString()
  })
}