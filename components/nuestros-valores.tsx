export function Values() {
  const values = [
    {
      number: "01",
      title: "Personalización con propósito",
      description: "Creamos prendas que cuentan tu historia. Cada diseño nace para reflejar tu esencia y acompañarte en momentos especiales..",
    },
    {
      number: "02",
      title: "Calidad que se siente",
      description: "Seleccionamos materiales que no solo se ven bien: se sienten bien, duran más y realzan cada detalle de la confección.",
    },
    {
      number: "03",
      title: "Compromiso en cada puntada",
      description: "Trabajamos con dedicación absoluta para superar tus expectativas y entregarte una prenda que realmente ames.",
    },
    {
      number: "04",
      title: "Creatividad que inspira",
      description: "Exploramos ideas, texturas y estilos para crear soluciones únicas, modernas y llenas de personalidad.",
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Título de la sección */}
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-center mb-16">Nuestros valores</h2>

          {/* Grid de valores */}
          <div className="grid md:grid-cols-2 gap-12">
            {values.map((value) => (
              <div key={value.number} className="flex gap-6">
                {/* Número del valor */}
                <div className="flex-shrink-0">
                  <span className="font-serif text-5xl font-bold text-primary/20">{value.number}</span>
                </div>
                {/* Contenido del valor */}
                <div>
                  <h3 className="font-semibold text-xl mb-2">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}