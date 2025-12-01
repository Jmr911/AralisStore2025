import mongoose from 'mongoose'

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

const PedidoSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: false // Opcional si permites compras sin login
  },
  userEmail: {
    type: String,
    required: false
  },
  userName: {
    type: String,
    required: false
  },
  items: [ItemPedidoSchema],
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
    unique: true
  }
}, {
  timestamps: true
})

// Generar número de pedido automáticamente
PedidoSchema.pre('save', async function(next) {
  if (!this.numeroPedido) {
    const count = await mongoose.models.Pedido.countDocuments()
    this.numeroPedido = `PED-${Date.now()}-${count + 1}`
  }
  next()
})

export default mongoose.models.Pedido || mongoose.model('Pedido', PedidoSchema)