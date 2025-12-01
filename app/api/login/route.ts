import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import bcrypt from "bcrypt"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    console.log("Login attempt:", email)

    if (!email || !password) {
      return NextResponse.json(
        { error: "Correo y contraseña son obligatorios" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("aralis_db")
    const usersCollection = db.collection("users")

    const user = await usersCollection.findOne({ email })
    
    console.log("User found:", user ? "Yes" : "No")
    
    if (!user) {
      return NextResponse.json(
        { error: "Correo o contraseña incorrectos" },
        { status: 401 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    console.log("Password valid:", isPasswordValid)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Correo o contraseña incorrectos" },
        { status: 401 }
      )
    }

    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    }

    console.log("Login successful, setting cookie for:", userData.name)

    const response = NextResponse.json({
      message: "Login exitoso",
      user: userData,
    })

    // Limpia la sesión anterior antes de crear una nueva
    response.cookies.delete("user_session")
    console.log("Sesión anterior eliminada (si existía)")

    // Crea la cookie de sesión con los datos del usuario
    response.cookies.set("user_session", JSON.stringify(userData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/",
    })

    console.log("Cookie set successfully")

    return response
  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}