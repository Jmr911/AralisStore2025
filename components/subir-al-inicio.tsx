"use client"

import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  // Detectamos cuándo el usuario ha hecho scroll para mostrar el botón
  useEffect(() => {
    const toggleVisibility = () => {
      // Mostramos el botón cuando se ha bajado más de 300px
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)

    // Limpiamos el listener al desmontar
    return () => {
      window.removeEventListener("scroll", toggleVisibility)
    }
  }, [])

  // Función que lleva al usuario de vuelta arriba con animación suave
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 rounded-full bg-primary p-3 text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 hover:scale-110 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      }`}
      aria-label="Volver arriba"
    >
      <ArrowUp className="h-6 w-6" />
    </button>
  )
}