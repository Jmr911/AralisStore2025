import { NextResponse, NextRequest } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const client = await clientPromise
    const db = client.db("aralis_db")

    const cotizacion = {
      items: data.items, // productos con color, talla y cantidad
      total: data.total,
      fecha: new Date(),
    }

    const result = await db.collection("cotizaciones").insertOne(cotizacion)

    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error("Error al guardar cotización:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Error desconocido" 
      }, 
      { status: 500 }
    )
  }
}