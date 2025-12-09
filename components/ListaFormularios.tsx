'use client'

import { useEffect, useState } from 'react'

interface Formulario {
  _id: string
  tipo: string
  // Campos comunes
  name?: string
  email?: string
  phone?: string
  fecha: string
  // Campos de contacto
  message?: string
  // Campos de personalización
  nombre?: string
  correo?: string
  telefono?: string
  garmentType?: string
  prenda?: string
  description?: string
  descripcion?: string
  measurements?: string
  medidas?: string
  wantsContact?: boolean
  urgente?: boolean
  preferredTime?: string
  hora_preferida?: string
  wantsToSendImages?: boolean
  desea_enviar_imagenes?: boolean
}

export default function ListaFormularios() {
  const [formularios, setFormularios] = useState<Formulario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargamos los formularios cuando se monta el componente
  useEffect(() => {
    async function cargarFormularios() {
      try {
        const response = await fetch('/api/obtener-formularios')
        const data = await response.json()
        
        if (data.success) {
          setFormularios(data.formularios)
        } else {
          setError('No se pudieron cargar los formularios')
        }
      } catch (err) {
        setError('Error de conexión')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    cargarFormularios()
  }, [])

  // Pantalla de carga
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-pulse">
          <p className="text-gray-600">Cargando formularios...</p>
        </div>
      </div>
    )
  }

  // Pantalla de error
  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">❌ {error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Encabezado con contador total */}
      <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800">
          Formularios Recibidos
        </h2>
        <p className="text-gray-600 mt-2">
          Total: <span className="font-semibold text-blue-600">{formularios.length}</span>
        </p>
      </div>
      
      {/* Mensaje si no hay formularios */}
      {formularios.length === 0 ? (
        <div className="p-12 bg-white rounded-lg shadow text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-500 text-lg">No hay formularios guardados todavía.</p>
        </div>
      ) : (
        // Lista de formularios
        <div className="grid grid-cols-1 gap-6">
          {formularios.map((form) => {
            // Normalizamos los campos porque pueden venir con diferentes nombres
            const nombre = form.name || form.nombre
            const email = form.email || form.correo
            const telefono = form.phone || form.telefono
            const isPersonalizacion = form.tipo === 'personalizacion'
            const isContacto = form.tipo === 'contacto'

            return (
              <div 
                key={form._id} 
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow"
              >
                {/* Cabecera del formulario con tipo y fecha */}
                <div className="flex justify-between items-start mb-4 pb-4 border-b">
                  <div>
                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                      isPersonalizacion 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {form.tipo === 'personalizacion' ? '✨ Personalización' : '💬 Contacto'}
                    </span>
                    {/* Etiqueta de urgente si aplica */}
                    {(form.wantsContact || form.urgente) && (
                      <span className="ml-2 inline-block px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
                        ⚠️ URGENTE
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(form.fecha).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(form.fecha).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Datos del cliente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                      👤 Nombre
                    </p>
                    <p className="text-gray-800 font-medium">
                      {nombre}
                    </p>
                  </div>
                  
                  {email && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                        📧 Email
                      </p>
                      <p className="text-gray-800 font-medium">
                        {email}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                      📱 Teléfono
                    </p>
                    <p className="text-gray-800 font-medium">
                      {telefono}
                    </p>
                  </div>

                  {/* Campos exclusivos de personalización */}
                  {isPersonalizacion && (
                    <>
                      {(form.garmentType || form.prenda) && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                            👗 Tipo de prenda
                          </p>
                          <p className="text-gray-800 font-medium">
                            {form.garmentType || form.prenda}
                          </p>
                        </div>
                      )}

                      {(form.preferredTime || form.hora_preferida) && (
                        <div className="md:col-span-2">
                          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                            ⏰ Hora preferida de contacto
                          </p>
                          <p className="text-gray-800 font-medium">
                            {form.preferredTime || form.hora_preferida}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Descripción o mensaje del cliente */}
                {(form.description || form.descripcion || form.message) && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                      {isPersonalizacion ? '✨ Descripción del diseño' : '💬 Mensaje'}
                    </p>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded">
                      {form.description || form.descripcion || form.message}
                    </p>
                  </div>
                )}

                {/* Medidas proporcionadas */}
                {(form.measurements || form.medidas) && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                      📏 Medidas
                    </p>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded">
                      {form.measurements || form.medidas}
                    </p>
                  </div>
                )}

                {/* Indicador si desea enviar imágenes */}
                {(form.wantsToSendImages || form.desea_enviar_imagenes) && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-purple-700 font-medium flex items-center">
                      <span className="mr-2">📸</span>
                      El cliente desea enviar imágenes de referencia por WhatsApp
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}