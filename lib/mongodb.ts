import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

// Verificamos que exista la URI de conexión a MongoDB
if (!uri) throw new Error("Falta MONGODB_URI en .env")

if (process.env.NODE_ENV === "development") {
  // En desarrollo, reutilizamos la conexión para evitar crear múltiples clientes
  // Esto es necesario porque Next.js recarga los módulos en hot reload
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri, options)
    ;(global as any)._mongoClientPromise = client.connect()
  }
  clientPromise = (global as any)._mongoClientPromise
} else {
  // En producción, creamos una nueva conexión cada vez
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Exportamos la promesa de conexión para usar en toda la app
export default clientPromise