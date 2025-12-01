import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative pt-16 md:pt-24 pb-8 md:pb-12 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-balance text-foreground mb-4">
            Creatividad a tu medida
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 leading-normal">
            Prendas personalizadas que expresan tu estilo con innovación y distinción.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="text-base">
              <Link href="/catalogo">Explorar catálogo</Link>
            </Button>
            <Button asChild variant="outline" className="text-base bg-transparent">
              <Link href="/personalizar">Personalizar prenda</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
      </div>
    </section>
  )
}
