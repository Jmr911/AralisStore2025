import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { enviarEmailPedido } from '@/lib/email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Obtener pedidos del usuario
export async function GET(request: NextRequest) {
  console.log('GET /api/pedidos - Obteniendo pedidos')
  
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    // Validar que se proporcione el email
    if (!email) {
      console.log('No se proporcionó email en la URL')
      return NextResponse.json(
        { error: 'Email requerido' },
        { status: 400 }
      )
    }

    console.log('Buscando pedidos para:', email)

    const client = await clientPromise
    const db = client.db()

    // Buscar pedidos por email y ordenar por fecha
    const pedidos = await db
      .collection('pedidos')
      .find({ email: email })
      .sort({ fechaPedido: -1 })
      .toArray()

    console.log(`Se encontraron ${pedidos.length} pedido(s)`)

    return NextResponse.json({
      pedidos,
      total: pedidos.length
    })

  } catch (error) {
    console.error('Error al obtener pedidos:', error)
    return NextResponse.json(
      { error: 'Error al cargar los pedidos' },
      { status: 500 }
    )
  }
}

// Generar número de pedido único con formato ARALIS-AÑOXXXX
async function generarNumeroPedidoUnico(db: any): Promise<string> {
  const añoActual = new Date().getFullYear()
  const maxIntentos = 50
  
  for (let intento = 0; intento < maxIntentos; intento++) {
    // Generar número aleatorio de 4 dígitos
    const numeroAleatorio = Math.floor(Math.random() * 9999) + 1
    const numeroFormateado = String(numeroAleatorio).padStart(4, '0')
    const numeroPedido = `ARALIS-${añoActual}${numeroFormateado}`
    
    // Verificar que no exista en la base de datos
    const pedidoExistente = await db.collection('pedidos').findOne({ 
      numeroPedido: numeroPedido 
    })
    
    if (!pedidoExistente) {
      console.log(`Número de pedido generado: ${numeroPedido} (intento ${intento + 1})`)
      return numeroPedido
    }
    
    console.log(`Número ${numeroPedido} ya existe, generando otro...`)
  }
  
  throw new Error('No se pudo generar un número de pedido único después de múltiples intentos')
}

// Crear nuevo pedido
export async function POST(request: NextRequest) {
  console.log('POST /api/pedidos - Creando pedido')
  
  try {
    const client = await clientPromise
    const db = client.db()
    
    const body = await request.json()

    // Validar que haya productos en el carrito
    if (!body.items || body.items.length === 0) {
      console.log('No hay productos en el carrito')
      return NextResponse.json(
        { error: 'No hay productos en el carrito' },
        { status: 400 }
      )
    }

    // Validar email del usuario
    if (!body.userEmail) {
      console.log('No se proporcionó email de usuario')
      return NextResponse.json(
        { error: 'Email de usuario requerido' },
        { status: 400 }
      )
    }

    console.log('Email del usuario:', body.userEmail)

    // Procesar items del carrito con sus detalles
    const itemsConSubtotal = body.items.map((item: any) => {
      return {
        productoId: item.id,
        nombre: item.name,
        sku: item.sku || 'N/A',
        imagen: item.image,
        categoria: item.category,
        precio: item.price,
        cantidad: item.quantity,
        color: item.color || null,
        talla: item.talla || null,
        subtotal: item.price * item.quantity
      }
    })

    console.log('Generando número de pedido aleatorio...')
    const numeroPedido = await generarNumeroPedidoUnico(db)

    console.log('Número de pedido final:', numeroPedido)

    // Preparar objeto del pedido con todos los datos
    const pedido = {
      numeroPedido: numeroPedido,
      nombreCliente: body.userName || '',
      email: body.userEmail,
      telefono: body.telefonoContacto || '',
      direccion: body.direccionEnvio || '',
      tipoEntrega: body.tipoEntrega || 'retiro',
      datosEnvio: body.datosEnvio || null,
      productos: itemsConSubtotal,
      total: body.total,
      estado: 'pendiente',
      notasCliente: body.notasAdicionales || '',
      fechaPedido: new Date(),
      fechaCreacion: new Date()
    }

    console.log('Guardando pedido en BD...')
    console.log('Pedido completo:', JSON.stringify(pedido, null, 2))
    
    // Guardar en MongoDB
    const resultado = await db.collection('pedidos').insertOne(pedido)

    console.log('Pedido guardado con ID:', resultado.insertedId)

    // Intentar enviar email de confirmación
    console.log('Enviando email de confirmación a:', pedido.email)
    try {
      const emailResult = await enviarEmailPedido({
        ...pedido,
        _id: resultado.insertedId
      })
      
      if (emailResult.success) {
        console.log('Email de confirmación enviado exitosamente')
      } else {
        console.log('Error enviando email:', emailResult.error)
      }
    } catch (emailError) {
      console.log('Error enviando email (pero pedido guardado):', emailError)
    }

    return NextResponse.json({
      success: true,
      pedido: {
        _id: resultado.insertedId,
        numeroPedido: pedido.numeroPedido,
        total: pedido.total,
        estado: pedido.estado,
        email: pedido.email
      },
      mensaje: 'Pedido guardado correctamente'
    })

  } catch (error) {
    console.error('============================================')
    console.error('Error completo al guardar pedido:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A')
    console.error('============================================')
    
    return NextResponse.json(
      { 
        error: 'Hubo un error al procesar el pedido',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}