import { Button } from "@/components/ui/button"
import { Scissors, Sparkles, Heart } from "lucide-react"
import Link from "next/link"

export function CustomizationCTA() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">Diseña tu prenda ideal</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Juntos damos forma a prendas que reflejan tu esencia
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Scissors className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Confección artesanal</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Cada prenda es elaborada con técnicas tradicionales y atención al detalle
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Diseño personalizado</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Adaptamos cada diseño a tus medidas, preferencias y necesidades específicas
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Calidad garantizada</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Utilizamos materiales de primera calidad para garantizar durabilidad y confort
              </p>
            </div>
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="text-base">
              <Link href="/personalizar">Solicitar personalización</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
