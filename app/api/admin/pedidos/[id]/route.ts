import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { enviarEmailCambioEstado } from '@/lib/email';

// Actualiza el estado de un pedido específico
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Obtiene el ID del pedido desde la URL
    const { id } = await params;
    
    // Revisa si hay un usuario logueado
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Solo admins pueden cambiar estados
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No tienes permisos de administrador' },
        { status: 403 }
      );
    }

    // Obtiene el nuevo estado del body
    const { estado } = await request.json();

    // Verifica que el estado sea válido
    const estadosPermitidos = ['pendiente', 'pagado', 'en preparación', 'enviado', 'entregado', 'cancelado'];
    
    if (!estadosPermitidos.includes(estado)) {
      return NextResponse.json(
        { error: 'Estado no válido' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Busca el pedido antes de actualizarlo (lo necesitamos para el email)
    const pedido = await db.collection('pedidos').findOne({ _id: new ObjectId(id) });

    if (!pedido) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    // Actualiza el estado en la base de datos
    const result = await db.collection('pedidos').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          estado: estado,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    // Envía email al cliente informando el cambio
    try {
      await enviarEmailCambioEstado(pedido, estado);
      console.log('Email de cambio de estado enviado correctamente');
    } catch (emailError) {
      console.error('Error al enviar email (el estado se actualizó correctamente):', emailError);
    }

    return NextResponse.json({
      success: true,
      mensaje: `Estado actualizado a: ${estado}`
    });

  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el pedido' },
      { status: 500 }
    );
  }
}