import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

// Obtiene la lista de todos los pedidos
export async function GET() {
  try {
    // Revisa si hay un usuario logueado
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Solo admins pueden ver todos los pedidos
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No tienes permisos de administrador' },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Trae todos los pedidos, ordenados del más reciente al más viejo
    const pedidosRaw = await db
      .collection('pedidos')
      .find({})
      .sort({ fechaPedido: -1 })
      .toArray();

    // Algunos pedidos viejos guardaron los datos con nombres diferentes
    // Este código normaliza todo para que funcione igual
    const pedidos = pedidosRaw.map(pedido => ({
      ...pedido,
      // Unifica el nombre del cliente
      userName: pedido.userName || pedido.nombreCliente || 'Cliente',
      // Unifica el email del cliente
      userEmail: pedido.userEmail || pedido.email || '',
      
      // Normaliza la lista de productos
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
      
      // Unifica otros campos
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