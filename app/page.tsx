"use client"

import { Header } from "@/components/header"
import { Hero } from "@/components/frase-inicial-frase-superior"
import { FeaturedProducts } from "@/components/Frase-superior-catalogo"
import { CustomizationCTA } from "@/components/frase-sobre-nuestros-valores"
import { Values } from "@/components/nuestros-valores"
import { Footer } from "@/components/footer"
import { DecorativeDivider } from "@/components/Division-decorativa"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header con navegación */}
      <Header />
      
      <main>
        {/* Sección inicial con frase de bienvenida */}
        <Hero />
        <DecorativeDivider />

        {/* Productos destacados */}
        <section className="relative">
          <FeaturedProducts />

          {/* Botón para ir al catálogo completo */}
          <div className="text-center -mt-16 mb-8">
            <Link href="/catalogo">
              <button
                className="px-8 py-3 font-medium rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-sm"
              >
                Ver Catálogo Completo
              </button>
            </Link>
          </div>

          <DecorativeDivider />
        </section>

        {/* Sección sobre personalización */}
        <CustomizationCTA />
        <DecorativeDivider />

        {/* Nuestros valores como empresa */}
        <Values />
        <DecorativeDivider />
      </main>
      
      {/* Footer con info de contacto */}
      <Footer />
    </div>
  )
}