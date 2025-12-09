/** @type {import('next').NextConfig} */
// Configuración de Next.js para el proyecto Aralis
const nextConfig = {
  typescript: {
    // Ignora errores de TypeScript durante el build
    // Útil para deployar rápidamente, pero no recomendado para producción final
    ignoreBuildErrors: true,
  },
  images: {
    // Desactiva la optimización automática de imágenes de Next.js
    // Necesario para algunos servicios de hosting como Netlify
    unoptimized: true,
  },
}

export default nextConfig