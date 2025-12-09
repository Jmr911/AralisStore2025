import { ProductCard } from "@/components/product-card"
import { mockProducts } from "@/lib/catalogo-productos"
import Image from "next/image"

export function FeaturedProducts() {
  // Tomamos los primeros 12 productos para la página principal
  const featured = mockProducts.slice(0, 12)

  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Encabezado de la sección */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Image src="/aralis-logo.png" alt="Aralis" width={120} height={120} className="h-24 w-auto rounded-lg" />
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">Nuestras Creaciones</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Descubre nuestra selección de prendas confeccionadas con dedicación y atención al detalle
          </p>
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}