import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import bcrypt from "bcrypt"
import { enviarEmailBienvenida } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    // Validar que todos los campos estén presentes
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("aralis_db")
    const usersCollection = db.collection("users")

    // Verificar si el email ya existe en la base de datos
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: "Este correo ya está registrado" },
        { status: 409 }
      )
    }

    // Encriptar la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear objeto de usuario nuevo
    const newUser = {
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    }

    // Guardar en MongoDB
    const result = await usersCollection.insertOne(newUser)

    // Enviar email de bienvenida (no bloquea el registro si falla)
    try {
      await enviarEmailBienvenida(email, name)
      console.log('✅ Email de bienvenida enviado a:', email)
    } catch (emailError) {
      console.error('⚠️ Error al enviar email de bienvenida:', emailError)
    }

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