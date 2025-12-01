"use client"

import { use, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, ArrowLeft, AlertTriangle } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { mockProducts } from "@/lib/catalogo-productos"
import { notFound } from "next/navigation"

// Componente decorativo de línea con círculo central
function DecorativeDivider() {
  return (
    <div className="w-full my-4">
      <div className="relative flex items-center justify-center">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-primary/30" />
        <div className="px-4">
          <div className="relative">
            <div className="w-5 h-5 rounded-full border-2 border-primary/30 bg-background" />
          </div>
        </div>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-primary/30 to-primary/30" />
      </div>
    </div>
  )
}

export default function ProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const tallaParam = searchParams.get("talla") || ""
  const colorParam = searchParams.get("color") || ""

  const { addItem } = useCart()
  const product = mockProducts.find((p) => p.id === id)

  const [selectedSize, setSelectedSize] = useState<string>(tallaParam)
  const [selectedColor, setSelectedColor] = useState<string>(colorParam)
  const [showWarning, setShowWarning] = useState<string | null>(null)
  const [addedToCart, setAddedToCart] = useState(false)
  const [isShaking, setIsShaking] = useState(false)

  if (!product) notFound()

  const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0
  const hasColors = Array.isArray(product.colors) && product.colors.length > 0

  // Selecciona automáticamente si solo hay una opción disponible
  useEffect(() => {
    if (product.sizes?.length === 1 && !selectedSize) setSelectedSize(product.sizes[0])
    if (product.colors?.length === 1 && !selectedColor) setSelectedColor(product.colors[0])
  }, [product.sizes, product.colors, selectedSize, selectedColor])

  // Efecto de animación shake cada 5 segundos
  useEffect(() => {
    const shakeInterval = setInterval(() => {
      if (!addedToCart) {
        setIsShaking(true)
        setTimeout(() => setIsShaking(false), 600)
      }
    }, 5000)

    return () => clearInterval(shakeInterval)
  }, [addedToCart])

  // Agrega el producto al carrito con las opciones seleccionadas
  const handleAddToCart = () => {
    if (hasSizes && !selectedSize) {
      setShowWarning("Por favor selecciona una talla antes de agregar al carrito.")
      return
    }
    if (hasColors && !selectedColor) {
      setShowWarning("Por favor selecciona un color antes de agregar al carrito.")
      return
    }

    addItem({
      ...product,
      talla: selectedSize,
      color: selectedColor,
    })

    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const closeWarning = () => setShowWarning(null)

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-2px); }
          40% { transform: translateX(2px); }
          60% { transform: translateX(-2px); }
        }
        
        .shake-animation {
          animation: shake 0.4s ease-in-out;
        }
      `}} />
      
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <section className="py-12 pt-24">
            <div className="container mx-auto px-4 max-w-6xl">
              <Button variant="ghost" asChild className="mb-6">
                <Link href="/catalogo">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al catálogo
                </Link>
              </Button>

              <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
                {/* Imagen del producto con zoom al hover */}
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted group">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                </div>

                {/* Información del producto */}
                <div className="flex flex-col">
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                    <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">{product.name}</h1>
                    <p className="text-3xl font-bold text-primary">₡{product.price.toLocaleString()}</p>
                  </div>

                  {/* Descripción del producto */}
                  <Card className="mb-4 shadow-sm w-full max-w-md">
                    <CardContent className="px-3 pt-0.5 pb-0.5">
                      <h2 className="font-semibold text-base mb-0">Descripción</h2>
                      <p className="text-sm text-muted-foreground leading-tight">
                        {product.description}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Detalles y opciones del producto */}
                  <Card className="mb-5 shadow-sm w-full max-w-md">
                    <CardContent className="px-3 py-1.5">
                      <h2 className="font-semibold text-base mb-1.5">Detalles</h2>
                      <ul className="text-sm text-muted-foreground mb-3 list-disc list-inside leading-snug">
                        <li>Confección artesanal</li>
                        <li>Materiales de alta calidad</li>
                        <li>Disponible en múltiples tallas</li>
                        <li>Posibilidad de personalización</li>
                      </ul>

                      <div className="w-full my-2">
                        <div className="relative flex items-center justify-center">
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-primary/30" />
                          <div className="px-4">
                            <div className="relative">
                              <div className="w-5 h-5 rounded-full border-2 border-primary/30 bg-background" />
                            </div>
                          </div>
                          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-primary/30 to-primary/30" />
                        </div>
                      </div>

                      {(hasSizes || hasColors) && (
                        <>
                          <h2 className="font-semibold text-base mb-1.5">Opciones</h2>

                          {/* Selector de tallas */}
                          {hasSizes && (
                            <div className="mb-3">
                              <h3 className="text-sm font-medium mb-1">
                                {product.sizes!.length > 1 ? "Elige la talla" : "Talla"}
                              </h3>
                              <div className="flex flex-wrap gap-1.5">
                                {product.sizes!.map((size) => (
                                  <button
                                    key={size}
                                    onClick={() =>
                                      setSelectedSize(selectedSize === size ? "" : size)
                                    }
                                    className={`min-w-[2.5rem] px-3 py-1.5 text-sm rounded-md border transition-all ${
                                      selectedSize === size
                                        ? "border-primary bg-primary text-white font-semibold"
                                        : "border-gray-300 hover:border-primary text-foreground"
                                    }`}
                                  >
                                    {size}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Selector de colores */}
                          {hasColors && (
                            <div>
                              <h3 className="text-sm font-medium mb-1">
                                {product.colors!.length > 1 ? "Elige el color" : "Color"}
                              </h3>
                              <div className="flex flex-wrap gap-1.5">
                                {product.colors!.map((color) => (
                                  <button
                                    key={color}
                                    onClick={() =>
                                      setSelectedColor(selectedColor === color ? "" : color)
                                    }
                                    className={`min-w-[2.5rem] px-3 py-1.5 text-sm rounded-md border transition-all ${
                                      selectedColor === color
                                        ? "border-primary bg-primary text-white font-semibold"
                                        : "border-gray-300 hover:border-primary text-foreground"
                                    }`}
                                  >
                                    {color}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Botones de acción */}
                  <div className="mt-auto space-y-3 w-full max-w-md">
                    <Button
                      size="lg"
                      className={`w-full text-base ${isShaking ? 'shake-animation' : ''}`}
                      onClick={handleAddToCart}
                      disabled={addedToCart}
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      {addedToCart ? "¡Agregado al carrito!" : "Agregar al carrito"}
                    </Button>

                    <p className="text-xs text-muted-foreground mt-2">
                      {product.sku}
                    </p>

                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full text-base bg-transparent"
                      asChild
                    >
                      <Link
                        href={`/personalizar?producto=${encodeURIComponent(product.name)}`}
                      >
                        Personalizar esta prenda
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />

        {/* Modal de advertencia */}
        {showWarning && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            onClick={closeWarning}
          >
            <div
              className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center mb-3">
                <AlertTriangle className="text-yellow-500 h-10 w-10" />
              </div>
              <p className="text-gray-800 font-semibold">{showWarning}</p>
              <Button className="mt-4" onClick={closeWarning}>
                Entendido
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}