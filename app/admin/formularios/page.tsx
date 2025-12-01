import ListaFormularios from '@/components/ListaFormularios'

// Página principal que muestra todos los formularios disponibles
export default function FormulariosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <ListaFormularios />
      </div>
    </div>
  )
}