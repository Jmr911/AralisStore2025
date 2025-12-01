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
      <Header />
      <main>
        <Hero />
        <DecorativeDivider />

        <section className="relative">
          <FeaturedProducts />

          <div className="text-center -mt-16 mb-8">
            <Link href="/catalogo">
              <button
                className="px-8 py-3 font-medium rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-sm"
              >
                Ver Catálogo Completo
              </button>
            </Link>
          </div>

          {/* Línea decorativa después del botón */}
          <DecorativeDivider />
        </section>

        <CustomizationCTA />
        <DecorativeDivider />

        <Values />

        {/* Línea decorativa debajo de "Nuestros Valores" */}
        <DecorativeDivider />
      </main>
      <Footer />
    </div>
  )
}
