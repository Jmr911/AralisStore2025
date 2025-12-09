// Definición de un producto en el catálogo
export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  sizes?: string[]          // Tallas disponibles del producto
  colors?: string[]         // Colores disponibles del producto
  target?: string           // Público objetivo (Hombre, Mujer, Niño, Niña, etc)
  selectedSize?: string     // Talla que el usuario seleccionó
  selectedColor?: string    // Color que el usuario seleccionó
  talla?: string            // Talla guardada en el carrito/pedido
  color?: string            // Color guardado en el carrito/pedido
  sku: string               // Código único del producto (SKU)
}

// Item en el carrito de compras (extiende Product y agrega cantidad)
export interface CartItem extends Product {
  quantity: number          // Cantidad de unidades agregadas al carrito
}

// Información del usuario para login/registro
export interface User {
  _id?: string              // ID del documento en MongoDB
  name: string              // Nombre del usuario
  email: string             // Correo electrónico del usuario
  password: string          // Contraseña encriptada con bcrypt
}