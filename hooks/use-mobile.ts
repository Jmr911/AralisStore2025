import * as React from 'react'

// Punto de quiebre para considerar un dispositivo móvil (768px)
const MOBILE_BREAKPOINT = 768

// Hook personalizado que detecta si estamos en un dispositivo móvil
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Creamos un media query para detectar pantallas pequeñas
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Función que actualiza el estado cuando cambia el tamaño de pantalla
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Escuchamos cambios en el tamaño de ventana
    mql.addEventListener('change', onChange)
    
    // Establecemos el valor inicial
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Limpiamos el listener al desmontar
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return !!isMobile
}