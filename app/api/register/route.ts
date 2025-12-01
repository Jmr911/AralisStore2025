import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import bcrypt from "bcrypt"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    // Valida que todos los campos estén presentes
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("aralis_db")
    const usersCollection = db.collection("users")

    // Verifica si el email ya está registrado
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: "Este correo ya está registrado" },
        { status: 409 }
      )
    }

    // Encripta la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crea el nuevo usuario
    const newUser = {
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    }

    const result = await usersCollection.insertOne(newUser)

    return NextResponse.json({
      message: "Cuenta creada correctamente",
      user: {
        id: result.insertedId.toString(),
        name: newUser.name,
        email: newUser.email,
      },
    })
  } catch (error) {
    console.error("Error en registro:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}