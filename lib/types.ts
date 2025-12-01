// Definición de producto
export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  sizes?: string[]          // Tallas disponibles
  colors?: string[]         // Colores disponibles
  target?: string           // Público objetivo (opcional)
  selectedSize?: string     // Talla seleccionada por el usuario
  selectedColor?: string    // Color seleccionado por el usuario
  talla?: string            // ✅ Agregar: Talla para el carrito/pedido
  color?: string            // ✅ Agregar: Color para el carrito/pedido
  sku: string               // SKU del producto
}

// Item del carrito
export interface CartItem extends Product {
  quantity: number          // Cantidad agregada al carrito
}

// 🧑‍💻 Usuario para login/registro
export interface User {
  _id?: string              // ID del documento en MongoDB
  name: string              // Nombre del usuario
  email: string             // Correo del usuario
  password: string          // Contraseña encriptada
}