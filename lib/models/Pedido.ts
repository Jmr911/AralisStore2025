import mongoose from 'mongoose'

// Esquema para cada producto dentro de un pedido
const ItemPedidoSchema = new mongoose.Schema({
  productoId: String,
  name: String,
  image: String,
  category: String,
  price: Number,
  quantity: Number,
  color: String,
  talla: String,
  subtotal: Number
})

// Esquema principal de pedidos
const PedidoSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: false // Permite compras sin estar logueado
  },
  userEmail: {
    type: String,
    required: false
  },
  userName: {
    type: String,
    required: false
  },
  items: [ItemPedidoSchema], // Lista de productos en el pedido
  total: {
    type: Number,
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'],
    default: 'pendiente'
  },
  metodoPago: {
    type: String,
    default: 'Por confirmar'
  },
  direccionEnvio: {
    type: String,
    required: false
  },
  telefonoContacto: {
    type: String,
    required: false
  },
  notasAdicionales: {
    type: String,
    required: false
  },
  fechaPedido: {
    type: Date,
    default: Date.now
  },
  numeroPedido: {
    type: String,
    unique: true // Cada pedido tiene un número único
  }
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
})

// Hook que genera automáticamente el número de pedido antes de guardar
PedidoSchema.pre('save', async function(next: any) {
  if (!this.numeroPedido) {
    const count = await mongoose.models.Pedido.countDocuments()
    this.numeroPedido = `PED-${Date.now()}-${count + 1}`
  }
  next()
})

// Exportamos el modelo, reutilizando si ya existe (importante para hot reload en desarrollo)
export default mongoose.models.Pedido || mongoose.model('Pedido', PedidoSchema)