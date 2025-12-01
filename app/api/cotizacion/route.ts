import { NextResponse, NextRequest } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(req: NextRequest) {
  try {
    // Extraemos los datos del body de la petición
    const data = await req.json()
    
    // Obtenemos la conexión a MongoDB
    const client = await clientPromise
    const db = client.db("aralis_db")

    // Estructura del documento que vamos a guardar
    const cotizacion = {
      items: data.items, // Array con los productos: cada uno tiene color, talla y cantidad
      total: data.total, // Monto total de la cotización
      fecha: new Date(), // Fecha actual del servidor
    }

    // Insertamos el documento en la colección
    const result = await db.collection("cotizaciones_al_por_mayor").insertOne(cotizacion)

    // Respondemos con éxito e incluimos el ID generado
    return NextResponse.json({ success: true, id: result.insertedId })
    
  } catch (error) {
    // Si algo falla, logueamos el error en el servidor
    console.error("Error al guardar cotización:", error)
    
    // Devolvemos una respuesta de error al cliente
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Error desconocido" 
      }, 
      { status: 500 }
    )
  }
}