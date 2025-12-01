import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("aralis_db")
    const collection = db.collection("formularios")

    // Obtiene los formularios ordenados por fecha descendente
    const formularios = await collection
      .find({})
      .sort({ fecha: -1 })
      .toArray()

    return NextResponse.json({ 
      success: true, 
      formularios,
      total: formularios.length 
    }, { status: 200 })
  } catch (error) {
    console.error("Error al obtener formularios:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Error al obtener formularios" 
    }, { status: 500 })
  }
}