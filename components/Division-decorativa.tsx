export function DecorativeDivider() {
  return (
    <div className="py-4 md:py-6">
      <div className="container mx-auto px-4">
        <div className="relative flex items-center justify-center">
          {/* Línea izquierda con degradado */}
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-primary/30" />

          {/* Círculo decorativo en el centro */}
          <div className="px-3">
            <div className="relative">
              <div className="w-6 h-6 rounded-full border-2 border-primary/30 bg-background" />
            </div>
          </div>

          {/* Línea derecha con degradado */}
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-primary/30 to-primary/30" />
        </div>
      </div>
    </div>
  )
}