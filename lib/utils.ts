import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Función utility para combinar clases de Tailwind de forma segura
// Combina clsx (para condicionales) con twMerge (para evitar conflictos de Tailwind)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}