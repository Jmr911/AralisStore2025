"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { ShoppingCart, AlertTriangle } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [warning, setWarning] = useState<string | null>(null)

  const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0
  const hasColors = Array.isArray(product.colors) && product.colors.length > 0
  const hasMultipleSizes = product.sizes && product.sizes.length > 1
  const hasMultipleColors = product.colors && product.colors.length > 1

  // ✅ Selección automática si hay solo una talla o color
  useEffect(() => {
    if (product.sizes?.length === 1) setSelectedSize(product.sizes[0])
    if (product.colors?.length === 1) setSelectedColor(product.colors[0])
  }, [product.sizes, product.colors])

  const handleAddToCart = () => {
    if (hasSizes && !selectedSize) {
      setWarning("Por favor selecciona una talla antes de agregar al carrito.")
      return
    }
    if (hasColors && !selectedColor) {
      setWarning("Por favor selecciona un color antes de agregar al carrito.")
      return
    }

    // ✅ CAMBIO AQUÍ: usar "talla" y "color" en lugar de "selectedSize" y "selectedColor"
    addItem({
      ...product,
      talla: selectedSize,
      color: selectedColor,
    })
  }

  const closeWarning = () => setWarning(null)

  // ✅ Enlace al producto con talla y color seleccionados
  const productLink = `/producto/${product.id}?talla=${encodeURIComponent(selectedSize)}&color=${encodeURIComponent(selectedColor)}`

  return (
    <>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow relative">
        <Link href={productLink}>
          <div className="relative aspect-square overflow-hidden bg-muted">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>

        <CardContent className="p-4 space-y-2">
          <Link href={productLink}>
            <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground">{product.category}</p>
          <p className="text-xl font-bold">₡{product.price.toLocaleString()}</p>

          {/* Selectores uno al lado del otro */}
          <div className="flex gap-2 mt-2">
            {hasSizes && (
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="w-1/2">
                  <SelectValue placeholder={hasMultipleSizes ? "Elige la talla" : "Talla"} />
                </SelectTrigger>
                <SelectContent>
                  {product.sizes!.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {hasColors && (
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger className="w-1/2">
                  <SelectValue placeholder={hasMultipleColors ? "Elige el color" : "Color"} />
                </SelectTrigger>
                <SelectContent>
                  {product.colors!.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex-col items-start gap-2">
          <Button className="w-full" onClick={handleAddToCart}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Agregar al carrito
          </Button>
          
          {/* ✅ SKU debajo del botón, alineado a la izquierda, color discreto */}
          {product.sku && (
            <span className="text-xs text-gray-500">
              {product.sku}
            </span>
          )}
        </CardFooter>
      </Card>

      {/* ⚠️ Modal de advertencia centrado */}
      {warning && (
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
            <p className="text-gray-800 font-semibold">{warning}</p>
            <Button className="mt-4" onClick={closeWarning}>
              Entendido
            </Button>
          </div>
        </div>
      )}
    </>
  )
}