/** @type {import('postcss-load-config').Config} */
// Configuración de PostCSS para el proyecto
// PostCSS procesa el CSS y aplica transformaciones (como Tailwind CSS)
const config = {
  plugins: {
    // Plugin de Tailwind CSS para PostCSS
    // Procesa las directivas de Tailwind y genera el CSS final
    '@tailwindcss/postcss': {},
  },
}

export default config