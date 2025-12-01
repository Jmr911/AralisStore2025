import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Solo administradores pueden ver todos los pedidos
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No tienes permisos de administrador' },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Obtiene todos los pedidos ordenados por fecha
    const pedidosRaw = await db
      .collection('pedidos')
      .find({})
      .sort({ fechaPedido: -1 })
      .toArray();

    // Normaliza la estructura para compatibilidad con diferentes versiones del schema
    const pedidos = pedidosRaw.map(pedido => ({
      ...pedido,
      userName: pedido.userName || pedido.nombreCliente || 'Cliente',
      userEmail: pedido.userEmail || pedido.email || '',
      
      items: pedido.items || (pedido.productos ? pedido.productos.map((p: any) => ({
        productoId: p.productoId,
        name: p.nombre,
        image: p.imagen,
        category: p.categoria,
        price: p.precio,
        quantity: p.cantidad,
        color: p.color,
        talla: p.talla,
        subtotal: p.subtotal
      })) : []),
      
      direccionEnvio: pedido.direccionEnvio || pedido.direccion || '',
      telefonoContacto: pedido.telefonoContacto || pedido.telefono || '',
      notasAdicionales: pedido.notasAdicionales || pedido.notasCliente || ''
    }));

    return NextResponse.json({
      success: true,
      pedidos: pedidos,
      total: pedidos.length
    });

  } catch (error) {
    console.error('Error al obtener todos los pedidos:', error);
    return NextResponse.json(
      { error: 'Error al obtener los pedidos' },
      { status: 500 }
    );
  }
}