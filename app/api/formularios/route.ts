import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const formData = await request.json()
    const client = await clientPromise
    const db = client.db("aralis_db")
    const collection = db.collection("formularios")

    // Guarda el formulario con la fecha actual
    await collection.insertOne({
      ...formData,
      fecha: new Date(),
    })

    return NextResponse.json({ message: "Formulario guardado correctamente" }, { status: 200 })
  } catch (error) {
    console.error("Error al guardar el formulario:", error)
    return NextResponse.json({ message: "Error al guardar el formulario" }, { status: 500 })
  }
}