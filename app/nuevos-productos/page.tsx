"use client"

import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { mockProducts } from "@/lib/catalogo-productos"

export default function HomePage() {
  const { addItem } = useCart()

  // Muestra los 6 productos más recientes del catálogo
  const featuredProducts = mockProducts.slice(0, 6)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl font-bold mb-8">Nuevos Productos</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="relative aspect-[3/4]">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent>
                  <h2 className="text-lg font-semibold">{product.name}</h2>
                  <p className="text-primary font-bold mb-2">
                    ₡{product.price.toLocaleString()}
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={() => addItem(product)}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" /> Agregar al carrito
                    </Button>
                    <Link
                      href={`/productos/${product.id}`}
                      className="text-sm text-center text-gray-600 hover:underline"
                    >
                      Ver detalles
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}