import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { enviarEmailCambioEstado } from '@/lib/email';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Solo administradores pueden cambiar estados
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No tienes permisos de administrador' },
        { status: 403 }
      );
    }

    const { estado } = await request.json();

    const estadosPermitidos = ['pendiente', 'pagado', 'en preparación', 'enviado', 'entregado', 'cancelado'];
    
    if (!estadosPermitidos.includes(estado)) {
      return NextResponse.json(
        { error: 'Estado no válido' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Busca el pedido antes de actualizar para poder enviar el email
    const pedido = await db.collection('pedidos').findOne({ _id: new ObjectId(params.id) });

    if (!pedido) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    const result = await db.collection('pedidos').updateOne(
      { _id: new ObjectId(params.id) },
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

    // Notifica al cliente por email del cambio de estado
    try {
      await enviarEmailCambioEstado(pedido, estado);
      console.log('Email de cambio de estado enviado correctamente');
    } catch (emailError) {
      console.error('Error al enviar email (el estado se actualizó correctamente):', emailError);
      // El pedido se actualiza aunque falle el email
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