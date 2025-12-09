"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "./ui/button"
import { useCart } from "./cart-provider"
import { ShoppingCart } from "lucide-react"
import { mockProducts } from "@/lib/catalogo-productos"
import { useState } from "react"

export function FeaturedProducts() {
  const { addItem } = useCart()
  const [addedToCart, setAddedToCart] = useState<string | null>(null)

  // Tomamos los primeros 4 productos para mostrar como destacados
  const featured = mockProducts.slice(0, 4)

  const handleAddToCart = (product: typeof featured[0]) => {
    addItem(product)
    setAddedToCart(product.id)
    // Después de 2 segundos volvemos el botón a su estado normal
    setTimeout(() => setAddedToCart(null), 2000)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 sm:px-6 lg:px-8">
      {featured.map((product) => (
        <div key={product.id} className="border rounded-lg p-4 flex flex-col items-center">
          {/* Imagen del producto - clickeable para ver detalles */}
          <Link href={`/productos/${product.id}`} className="relative w-full aspect-[3/4] mb-2">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover rounded-lg"
              priority
            />
          </Link>

          {/* Nombre y precio del producto */}
          <h3 className="font-semibold text-lg text-center">{product.name}</h3>
          <p className="text-primary font-bold text-center">₡{product.price.toLocaleString()}</p>

          {/* Botón para agregar al carrito */}
          <Button
            size="sm"
            className="mt-2 w-full"
            onClick={() => handleAddToCart(product)}
            disabled={addedToCart === product.id}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            {addedToCart === product.id ? "Agregado" : "Agregar"}
          </Button>
        </div>
      ))}
    </div>
  )
}