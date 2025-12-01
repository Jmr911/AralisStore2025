"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { mockProducts } from "@/lib/catalogo-productos"
import { Search } from "lucide-react"
import { DecorativeDivider } from "@/components/Division-decorativa"

export default function CatalogoPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [targetFilter, setTargetFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")

  // Extrae categorías únicas de los productos
  const categories = ["all", ...Array.from(new Set(mockProducts.map((p) => p.category)))]

  // Aplica filtros y ordenamiento a los productos
  const filteredProducts = mockProducts
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
      const matchesTarget = targetFilter === "all" || product.target === targetFilter
      return matchesSearch && matchesCategory && matchesTarget
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price
      if (sortBy === "price-desc") return b.price - a.price
      return a.name.localeCompare(b.name)
    })

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Encabezado de la página */}
        <section className="pt-16 pb-8 md:pt-24 md:pb-12 bg-secondary/30">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              Catálogo de productos
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Explora nuestra colección de prendas confeccionadas con calidad artesanal.
            </p>
          </div>
        </section>

        {/* Barra de filtros y búsqueda */}
        <section className="py-8 border-b bg-card">
          <div className="container mx-auto px-4 flex flex-col gap-6">
            <div className="w-full sm:w-64">
              <Label htmlFor="target" className="sr-only">
                Público objetivo
              </Label>
              <Select value={targetFilter} onValueChange={setTargetFilter}>
                <SelectTrigger id="target">
                  <SelectValue placeholder="Público objetivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Hombre">Hombre</SelectItem>
                  <SelectItem value="Mujer">Mujer</SelectItem>
                  <SelectItem value="Niño">Niño</SelectItem>
                  <SelectItem value="Niña">Niña</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full sm:w-56">
                <Label htmlFor="category" className="sr-only">
                  Categoría
                </Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories
                      .filter((c) => c !== "all")
                      .map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative w-full sm:w-64">
                <Label htmlFor="search" className="sr-only">
                  Buscar
                </Label>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex items-center gap-2 md:ml-auto">
                <Label htmlFor="sort" className="text-sm font-medium whitespace-nowrap">
                  Ordenar por:
                </Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="sort" className="w-full md:w-48">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nombre</SelectItem>
                    <SelectItem value="price-asc">Precio: Menor a mayor</SelectItem>
                    <SelectItem value="price-desc">Precio: Mayor a menor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Cuadrícula de productos */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="border p-4 rounded-md relative">
                    <ProductCard product={product} />
                    <p className="text-xs text-muted-foreground mt-3">
                      SKU: {product.sku}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Próximamente más productos en esta categoría.
                </p>
              </div>
            )}
          </div>
        </section>

        <DecorativeDivider />
      </main>

      <Footer />
    </div>
  )
}