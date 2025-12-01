// app/api/guardar-formulario/route.ts
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { nombre_del_cliente, correo_del_cliente, telefono_del_cliente, mensaje_del_cliente } = body

    if (!nombre_del_cliente || !mensaje_del_cliente) {
      // Solo nombre y mensaje son obligatorios
      return NextResponse.json({ message: "Faltan campos obligatorios" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("aralis_db")
    const result = await db.collection("formularios").insertOne({
      nombre_del_cliente,
      correo_del_cliente: correo_del_cliente || "", // opcional
      telefono_del_cliente: telefono_del_cliente || "", // opcional
      mensaje_del_cliente,
      fecha: new Date()
    })

    return NextResponse.json(
      { message: "Formulario guardado correctamente", id: result.insertedId },
      { status: 201 }
    )
  } catch (error) {
    console.error("❌ Error en /api/guardar-formulario:", error)
    return NextResponse.json(
      { message: "Error interno del servidor", error: (error as Error).message },
      { status: 500 }
    )
  }
}
