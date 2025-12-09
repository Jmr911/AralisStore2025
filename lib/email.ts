// lib/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Config de los emails
const EMAIL_CONFIG = {
  from: 'Aralis <noreply@aralisstore.com>',
  brandColor: '#5D4037',
  accentColor: '#C9A96E',
  lightBg: '#F8F6F0',
  brandName: 'Aralis',
  supportEmail: 'jmr91_@hotmail.com',
  whatsapp: '+506 8319-5781',
  adminEmail: 'AralisModa@hotmail.com' // Email para notificaciones admin
}

// Función helper para notificar al admin sobre eventos importantes
async function notificarAdmin(asunto: string, contenidoHTML: string, contenidoTexto: string) {
  try {
    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: EMAIL_CONFIG.adminEmail,
      subject: `[ADMIN] ${asunto}`,
      html: contenidoHTML,
      text: contenidoTexto
    })
    console.log('Notificación enviada al admin')
  } catch (error) {
    console.error('Error al notificar al admin:', error)
  }
}

// Envía email de recuperación de contraseña
export async function enviarEmailRecuperacion(email: string, token: string) {
  try {
    // URL con el token para restablecer
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/restablecer-contrasena?token=${token}`
    
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: email,
      subject: '🔐 Recuperar Contraseña - Aralis',
      html: generarHTMLRecuperacion(resetUrl),
      text: generarTextoPlanoRecuperacion(resetUrl)
    })

    if (error) {
      console.error('Error enviando email de recuperación:', error)
      return { success: false, error: error.message || 'Error al enviar email' }
    }

    console.log('Email de recuperación enviado a:', email)

    // Notificar al admin
    await notificarAdmin(
      'Solicitud de recuperación de contraseña',
      `<p><strong>Usuario:</strong> ${email}<br><strong>Fecha:</strong> ${new Date().toLocaleString('es-CR')}</p>`,
      `Usuario: ${email}\nFecha: ${new Date().toLocaleString('es-CR')}`
    )

    return { success: true, data }

  } catch (error) {
    console.error('Excepción al enviar email de recuperación:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// Envía email de confirmación de cambio de contraseña
export async function enviarEmailConfirmacionCambio(email: string, nombre?: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: email,
      subject: '✅ Contraseña Actualizada - Aralis',
      html: generarHTMLConfirmacionCambio(nombre),
      text: generarTextoPlanoConfirmacionCambio(nombre)
    })

    if (error) {
      console.error('Error enviando confirmación de cambio:', error)
      return { success: false, error: error.message }
    }

    console.log('Confirmación de cambio enviada a:', email)

    // Notificar al admin
    await notificarAdmin(
      'Contraseña actualizada',
      `<p><strong>Usuario:</strong> ${nombre || 'Sin nombre'}<br><strong>Email:</strong> ${email}<br><strong>Fecha:</strong> ${new Date().toLocaleString('es-CR')}</p>`,
      `Usuario: ${nombre || 'Sin nombre'}\nEmail: ${email}\nFecha: ${new Date().toLocaleString('es-CR')}`
    )

    return { success: true, data }

  } catch (error) {
    console.error('Excepción al enviar confirmación:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// Envía email cuando el usuario cambia su perfil
export async function enviarEmailCambioPerfil(
  emailDestino: string,
  nombre: string,
  cambios: {
    nombreAnterior?: string,
    nombreNuevo?: string,
    emailAnterior?: string,
    emailNuevo?: string
  }
) {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: emailDestino,
      subject: '✅ Perfil Actualizado - Aralis',
      html: generarHTMLCambioPerfil(nombre, cambios),
      text: generarTextoplanoCambioPerfil(nombre, cambios)
    })

    if (error) {
      console.error('Error enviando confirmación de cambio de perfil:', error)
      return { success: false, error: error.message }
    }

    console.log('Confirmación de cambio de perfil enviada a:', emailDestino)

    // Armar lista de cambios para el admin
    const cambiosTexto = []
    if (cambios.nombreAnterior && cambios.nombreNuevo) {
      cambiosTexto.push(`Nombre: ${cambios.nombreAnterior} → ${cambios.nombreNuevo}`)
    }
    if (cambios.emailAnterior && cambios.emailNuevo) {
      cambiosTexto.push(`Email: ${cambios.emailAnterior} → ${cambios.emailNuevo}`)
    }

    // Notificar al admin
    await notificarAdmin(
      'Perfil actualizado',
      `<p><strong>Usuario:</strong> ${nombre}<br><strong>Email:</strong> ${emailDestino}<br><strong>Cambios:</strong><br>${cambiosTexto.map(c => `- ${c}`).join('<br>')}<br><strong>Fecha:</strong> ${new Date().toLocaleString('es-CR')}</p>`,
      `Usuario: ${nombre}\nEmail: ${emailDestino}\nCambios:\n${cambiosTexto.join('\n')}\nFecha: ${new Date().toLocaleString('es-CR')}`
    )

    return { success: true, data }

  } catch (error) {
    console.error('Excepción al enviar confirmación de cambio de perfil:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// Envía email de bienvenida a nuevos usuarios
export async function enviarEmailBienvenida(email: string, nombre: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: email,
      subject: '🎉 ¡Bienvenido a Aralis!',
      html: generarHTMLBienvenida(nombre),
      text: generarTextoplanoBienvenida(nombre)
    })

    if (error) {
      console.error('Error enviando email de bienvenida:', error)
      return { success: false, error: error.message }
    }

    console.log('Email de bienvenida enviado a:', email)

    // Notificar al admin del nuevo registro
    await notificarAdmin(
      'Nuevo usuario registrado',
      `<p><strong>Nombre:</strong> ${nombre}<br><strong>Email:</strong> ${email}<br><strong>Fecha:</strong> ${new Date().toLocaleString('es-CR')}</p>`,
      `Nombre: ${nombre}\nEmail: ${email}\nFecha: ${new Date().toLocaleString('es-CR')}`
    )

    return { success: true, data }

  } catch (error) {
    console.error('Excepción al enviar email de bienvenida:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// Envía email de confirmación de pedido
export async function enviarEmailPedido(pedido: any) {
  try {
    // HTML de cada producto con sus detalles
    const productosHTML = pedido.productos.map((prod: any) => `
      <div style="padding: 15px 0; border-bottom: 1px solid #E8E6DD;">
        <div style="font-weight: 600; color: #2C1810; margin-bottom: 6px; font-size: 15px;">${prod.nombre}</div>
        ${prod.sku ? `<div style="font-size: 13px; color: #888888; margin-bottom: 3px; font-family: 'Courier New', monospace;">${prod.sku}</div>` : ''}
        ${prod.color ? `<div style="font-size: 14px; color: #666666; margin-bottom: 3px;">Color: ${prod.color}</div>` : ''}
        ${prod.talla ? `<div style="font-size: 14px; color: #666666; margin-bottom: 3px;">Talla: ${prod.talla}</div>` : ''}
        <div style="font-size: 14px; color: #666666;">Cantidad: ${prod.cantidad}</div>
      </div>
    `).join('')

    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: pedido.email,
      subject: `✅ Confirmación de Pedido #${pedido.numeroPedido} - Aralis`,
      html: generarHTMLPedido(pedido, productosHTML),
      text: generarTextoplanoPedido(pedido)
    })

    if (error) {
      console.error('Error enviando email de pedido:', error)
      return { success: false, error: error.message }
    }

    console.log('Email de pedido enviado a:', pedido.email)
    console.log('Pedido número:', pedido.numeroPedido)

    // Info de productos para el admin
    const productosTexto = pedido.productos.map((prod: any) => 
      `${prod.nombre}${prod.sku ? ` [${prod.sku}]` : ''} - Cant: ${prod.cantidad}${prod.color ? ` (${prod.color})` : ''}${prod.talla ? ` Talla: ${prod.talla}` : ''}`
    ).join('\n')

    // Notificar al admin del nuevo pedido
    await notificarAdmin(
      `Nuevo Pedido #${pedido.numeroPedido}`,
      `
        <h3>Nuevo Pedido Recibido</h3>
        <p><strong>Pedido:</strong> ${pedido.numeroPedido}<br>
        <strong>Cliente:</strong> ${pedido.nombreCliente}<br>
        <strong>Email:</strong> ${pedido.email}<br>
        <strong>Teléfono:</strong> ${pedido.telefono || 'No proporcionado'}<br>
        <strong>Total:</strong> ₡${pedido.total.toLocaleString('es-CR')}<br>
        <strong>Dirección:</strong> ${pedido.direccion}<br>
        ${pedido.notasCliente ? `<strong>Notas:</strong> ${pedido.notasCliente}<br>` : ''}
        <strong>Fecha:</strong> ${new Date(pedido.fechaPedido).toLocaleString('es-CR')}</p>
        <h4>Productos:</h4>
        ${productosHTML}
      `,
      `PEDIDO #${pedido.numeroPedido}\n\nCliente: ${pedido.nombreCliente}\nEmail: ${pedido.email}\nTeléfono: ${pedido.telefono || 'No proporcionado'}\nTotal: ₡${pedido.total.toLocaleString('es-CR')}\n\nProductos:\n${productosTexto}\n\nDirección: ${pedido.direccion}\n${pedido.notasCliente ? `Notas: ${pedido.notasCliente}\n` : ''}Fecha: ${new Date(pedido.fechaPedido).toLocaleString('es-CR')}`
    )

    return { success: true, data }

  } catch (error) {
    console.error('Excepción al enviar email de pedido:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// Envía email cuando cambia el estado del pedido
export async function enviarEmailCambioEstado(pedido: any, nuevoEstado: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: pedido.userEmail || pedido.email,
      subject: `📦 Actualización de Pedido #${pedido.numeroPedido} - Aralis`,
      html: generarHTMLCambioEstado(pedido, nuevoEstado),
      text: generarTextoplanoCambioEstado(pedido, nuevoEstado)
    })

    if (error) {
      console.error('Error enviando email de cambio de estado:', error)
      return { success: false, error: error.message }
    }

    console.log('Email de cambio de estado enviado a:', pedido.userEmail || pedido.email)
    console.log('Pedido número:', pedido.numeroPedido)
    console.log('Nuevo estado:', nuevoEstado)

    // Notificar al admin del cambio de estado
    await notificarAdmin(
      `Cambio de Estado - Pedido #${pedido.numeroPedido}`,
      `
        <p><strong>Pedido:</strong> ${pedido.numeroPedido}<br>
        <strong>Cliente:</strong> ${pedido.userName || pedido.nombreCliente || 'Cliente'}<br>
        <strong>Email:</strong> ${pedido.userEmail || pedido.email}<br>
        <strong>Nuevo Estado:</strong> ${nuevoEstado.toUpperCase()}<br>
        <strong>Total:</strong> ₡${pedido.total.toLocaleString('es-CR')}<br>
        <strong>Fecha:</strong> ${new Date().toLocaleString('es-CR')}</p>
      `,
      `PEDIDO #${pedido.numeroPedido}\n\nCliente: ${pedido.userName || pedido.nombreCliente || 'Cliente'}\nEmail: ${pedido.userEmail || pedido.email}\nNuevo Estado: ${nuevoEstado.toUpperCase()}\nTotal: ₡${pedido.total.toLocaleString('es-CR')}\nFecha: ${new Date().toLocaleString('es-CR')}`
    )

    return { success: true, data }

  } catch (error) {
    console.error('Excepción al enviar email de cambio de estado:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// Plantillas HTML de los emails

function generarHTMLRecuperacion(resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recuperar Contraseña</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              
              <tr>
                <td style="background-color: ${EMAIL_CONFIG.brandColor}; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                    🔐 Recuperar Contraseña
                  </h1>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                    Hola,
                  </p>
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                    Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>${EMAIL_CONFIG.brandName}</strong>.
                  </p>
                  <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #374151;">
                    Haz clic en el botón de abajo para crear una nueva contraseña:
                  </p>
                  
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="padding: 0 0 30px;">
                        <a href="${resetUrl}" style="display: inline-block; background-color: ${EMAIL_CONFIG.brandColor}; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 6px; text-align: center;">
                          Restablecer Contraseña
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 30px;">
                    <tr>
                      <td style="padding: 20px;">
                        <p style="margin: 0 0 10px; font-size: 14px; font-weight: 600; color: #92400e;">
                          ⚠️ Importante:
                        </p>
                        <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 1.6;">
                          <li>Este enlace expira en <strong>1 hora</strong></li>
                          <li>Solo se puede usar <strong>una vez</strong></li>
                          <li>Si no solicitaste este cambio, comunícate con Aralis de inmediato</li>
                          <li>Tu contraseña actual sigue siendo válida hasta que la cambies</li>
                        </ul>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 0 0 10px; font-size: 14px; line-height: 1.6; color: #6b7280;">
                    Si el botón no funciona, copia y pega este enlace en tu navegador:
                  </p>
                  <p style="margin: 0; font-size: 14px; word-break: break-all; color: #3b82f6;">
                    <a href="${resetUrl}" style="color: #3b82f6; text-decoration: none;">${resetUrl}</a>
                  </p>
                </td>
              </tr>
              
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 10px; font-size: 16px; font-weight: 600; color: #111827;">
                    ${EMAIL_CONFIG.brandName}
                  </p>
                  <p style="margin: 0 0 5px; font-size: 14px; color: #6b7280;">
                    Prendas Personalizadas
                  </p>
                  <p style="margin: 0; font-size: 14px; color: #6b7280;">
                    WhatsApp: <a href="https://wa.me/50683195781" style="color: #3b82f6; text-decoration: none;">${EMAIL_CONFIG.whatsapp}</a>
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

function generarHTMLConfirmacionCambio(nombre?: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Contraseña Actualizada</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              
              <tr>
                <td style="background-color: #10b981; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                    ✅ Contraseña Actualizada
                  </h1>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                    ${nombre ? `Hola ${nombre},` : 'Hola,'}
                  </p>
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                    Tu contraseña se actualizó correctamente.
                  </p>
                  <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #374151;">
                    Ya puedes iniciar sesión en ${EMAIL_CONFIG.brandName} con tu nueva contraseña.
                  </p>
                  
                  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
                    <tr>
                      <td style="padding: 20px;">
                        <p style="margin: 0 0 10px; font-size: 14px; font-weight: 600; color: #991b1b;">
                          🔒 Aviso de Seguridad:
                        </p>
                        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #991b1b;">
                          Si no fuiste tú quien realizó este cambio, contáctanos de inmediato en 
                          <a href="https://wa.me/50683195781" style="color: #991b1b; font-weight: 600;">${EMAIL_CONFIG.whatsapp}</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 10px; font-size: 16px; font-weight: 600; color: #111827;">
                    ${EMAIL_CONFIG.brandName}
                  </p>
                  <p style="margin: 0 0 5px; font-size: 14px; color: #6b7280;">
                    Prendas Personalizadas
                  </p>
                  <p style="margin: 0; font-size: 14px; color: #6b7280;">
                    WhatsApp: <a href="https://wa.me/50683195781" style="color: #3b82f6; text-decoration: none;">${EMAIL_CONFIG.whatsapp}</a>
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

function generarHTMLCambioPerfil(
  nombre: string,
  cambios: {
    nombreAnterior?: string,
    nombreNuevo?: string,
    emailAnterior?: string,
    emailNuevo?: string
  }
): string {
  const cambioNombre = cambios.nombreAnterior && cambios.nombreNuevo
  const cambioEmail = cambios.emailAnterior && cambios.emailNuevo
  
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Perfil Actualizado</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              
              <tr>
                <td style="background-color: #3b82f6; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                    ✅ Perfil Actualizado
                  </h1>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                    Hola ${nombre},
                  </p>
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                    Tu perfil en <strong>${EMAIL_CONFIG.brandName}</strong> se actualizó correctamente.
                  </p>
                  
                  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 4px; margin-bottom: 30px;">
                    <tr>
                      <td style="padding: 20px;">
                        <p style="margin: 0 0 10px; font-size: 14px; font-weight: 600; color: #1e40af;">
                          📝 Cambios realizados:
                        </p>
                        <ul style="margin: 0; padding-left: 20px; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
                        ${cambioNombre ? `<li>Nombre: <strong>${cambios.nombreNuevo}</strong></li>` : ''}
                        ${cambioEmail ? `<li>Correo electrónico: <strong>${cambios.emailNuevo}</strong></li>` : ''}
                        </ul>
                      </td>
                    </tr>
                  </table>
                  
                  ${cambioEmail ? `
                    <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #374151;">
                      <strong>Importante:</strong> Ahora debes usar tu nuevo correo (${cambios.emailNuevo}) para iniciar sesión.
                    </p>
                  ` : ''}
                  
                  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
                    <tr>
                      <td style="padding: 20px;">
                        <p style="margin: 0 0 10px; font-size: 14px; font-weight: 600; color: #991b1b;">
                          🔒 Aviso de Seguridad:
                        </p>
                        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #991b1b;">
                          Si no fuiste tú quien realizó este cambio, contáctanos de inmediato en 
                          <a href="https://wa.me/50683195781" style="color: #991b1b; font-weight: 600;">${EMAIL_CONFIG.whatsapp}</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 10px; font-size: 16px; font-weight: 600; color: #111827;">
                    ${EMAIL_CONFIG.brandName}
                  </p>
                  <p style="margin: 0 0 5px; font-size: 14px; color: #6b7280;">
                    Prendas Personalizadas
                  </p>
                  <p style="margin: 0; font-size: 14px; color: #6b7280;">
                    WhatsApp: <a href="https://wa.me/50683195781" style="color: #3b82f6; text-decoration: none;">${EMAIL_CONFIG.whatsapp}</a>
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

function generarHTMLBienvenida(nombre: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bienvenido a Aralis</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F5F5F5;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F5F5F5;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              
              <tr>
                <td style="background-color: ${EMAIL_CONFIG.brandColor}; padding: 40px; text-align: center;">
                  <h1 style="margin: 0 0 10px; font-family: Georgia, serif; font-size: 36px; font-weight: 700; color: #FFFFFF; letter-spacing: 3px;">
                    ARALIS
                  </h1>
                  <p style="margin: 0; font-size: 14px; color: #FFE4B5; font-style: italic; font-weight: 600; letter-spacing: 1px;">
                    TU ESTILO, NUESTRA INSPIRACIÓN
                  </p>
                </td>
              </tr>
              
              <tr>
                <td style="background-color: ${EMAIL_CONFIG.lightBg}; padding: 40px; text-align: center;">
                  <div style="font-size: 64px; margin-bottom: 20px;">🎉</div>
                  <h2 style="margin: 0 0 15px; font-size: 28px; color: #2C1810; font-weight: 700;">
                    ¡Bienvenido a Aralis!
                  </h2>
                  <p style="margin: 0; font-size: 18px; color: #5D4037; font-weight: 600;">
                    ${nombre}
                  </p>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.7; color: #333333;">
                    Gracias por crear tu cuenta en <strong>Aralis</strong>. Nos alegra tenerte con nosotros.
                  </p>
                  <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.7; color: #333333;">
                    Ahora puedes disfrutar de:
                  </p>
                  
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 30px;">
                    <tr>
                      <td style="padding: 15px; background-color: #F8F6F0; border-left: 4px solid ${EMAIL_CONFIG.accentColor}; margin-bottom: 10px;">
                        <p style="margin: 0; font-size: 15px; color: #2C1810;">
                          <strong>✨ Prendas personalizadas</strong> a tu medida
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 15px; background-color: #F8F6F0; border-left: 4px solid ${EMAIL_CONFIG.accentColor}; margin-bottom: 10px;">
                        <p style="margin: 0; font-size: 15px; color: #2C1810;">
                          <strong>📦 Seguimiento de pedidos</strong> en tiempo real
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 15px; background-color: #F8F6F0; border-left: 4px solid ${EMAIL_CONFIG.accentColor};">
                        <p style="margin: 0; font-size: 15px; color: #2C1810;">
                          <strong>🎨 Acceso a colecciones exclusivas</strong>
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.7; color: #333333;">
                    Explora nuestro catálogo y encuentra la prenda perfecta para ti.
                  </p>
                  
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td align="center" style="padding: 0 0 30px;">
                        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/catalogo" 
                           style="display: inline-block; background-color: ${EMAIL_CONFIG.brandColor}; color: #FFFFFF; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 6px; text-align: center;">
                          Ver Catálogo
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <tr>
                <td style="background-color: ${EMAIL_CONFIG.brandColor}; padding: 30px; text-align: center;">
                  <p style="margin: 0 0 10px; font-size: 15px; color: #FFE4B5; font-weight: 600;">
                    ¿Tienes alguna pregunta?
                  </p>
                  <p style="margin: 0; font-size: 16px; color: #FFFFFF; font-weight: 700;">
                    📱 WhatsApp: <a href="https://wa.me/50683195781" style="color: #FFD700; text-decoration: none;">${EMAIL_CONFIG.whatsapp}</a>
                  </p>
                </td>
              </tr>
              
              <tr>
                <td style="background-color: ${EMAIL_CONFIG.lightBg}; padding: 30px; text-align: center; border-top: 2px solid ${EMAIL_CONFIG.accentColor};">
                  <p style="margin: 0 0 8px; font-size: 14px; color: #5D4037; font-style: italic; font-weight: 600;">
                    Tu Estilo, Nuestra Inspiración
                  </p>
                  <p style="margin: 0 0 15px; font-size: 14px; color: #666666; font-weight: 600;">
                    Tacacori, Alajuela, Costa Rica
                  </p>
                  <p style="margin: 0; font-size: 13px; color: #888888;">
                    © ${new Date().getFullYear()} Aralis. Todos los derechos reservados.
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

function generarHTMLPedido(pedido: any, productosHTML: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Pedido</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F5F5F5;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F5F5F5;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              
              <tr>
                <td style="background-color: #5D4037; padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                  <h1 style="margin: 0; color: #FFFFFF; font-size: 28px; font-weight: 700; letter-spacing: 1px;">
                    🎉 ¡Gracias por tu compra en Aralis!
                  </h1>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 8px; font-size: 15px; color: #666666; font-weight: 500;">
                    Hola,
                  </p>
                  <h2 style="margin: 0 0 25px; font-size: 26px; color: #2C1810; font-weight: 700; line-height: 1.3;">
                    ${pedido.nombreCliente}
                  </h2>
                  <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.7; color: #333333; font-weight: 500;">
                    Recibimos tu pedido y lo estamos procesando. Nos pondremos en contacto contigo pronto para confirmar los detalles.
                  </p>
                  
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${EMAIL_CONFIG.lightBg}; border-radius: 8px; padding: 25px; margin-bottom: 30px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
                    <tr>
                      <td>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                          <tr>
                            <td style="padding: 0 0 18px 0; border-bottom: 2px solid ${EMAIL_CONFIG.accentColor};">
                              <p style="margin: 0; font-size: 13px; color: #666666; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                                📋 Información del Pedido
                              </p>
                            </td>
                          </tr>
                        </table>
                        
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 18px; margin-bottom: 20px;">
                          <tr>
                            <td style="padding: 8px 0;">
                              <span style="font-size: 14px; color: #555555; font-weight: 600;">Número de Pedido:</span>
                            </td>
                            <td style="padding: 8px 0; text-align: right;">
                              <span style="font-size: 15px; color: #2C1810; font-weight: 700; font-family: 'Courier New', monospace;">${pedido.numeroPedido}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0;">
                              <span style="font-size: 14px; color: #555555; font-weight: 600;">Fecha:</span>
                            </td>
                            <td style="padding: 8px 0; text-align: right;">
                              <span style="font-size: 14px; color: #2C1810; font-weight: 600;">
                                ${new Date(pedido.fechaPedido).toLocaleDateString('es-CR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </td>
                          </tr>
                        </table>
                        
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                          <tr>
                            <td style="padding: 18px 0 12px 0; border-top: 2px solid #E8E6DD;">
                              <p style="margin: 0; font-size: 15px; color: #555555; font-weight: 600;">
                                Productos:
                              </p>
                            </td>
                          </tr>
                        </table>
                        ${productosHTML}
                        
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 20px; padding-top: 20px; border-top: 2px solid ${EMAIL_CONFIG.accentColor};">
                          <tr>
                            <td style="padding: 8px 0;">
                              <span style="font-size: 16px; color: #555555; font-weight: 600;">Total:</span>
                            </td>
                            <td style="padding: 8px 0; text-align: right;">
                              <span style="font-size: 22px; color: #2C1810; font-weight: 700;">₡${pedido.total.toLocaleString('es-CR')}</span>
                            </td>
                          </tr>
                        </table>
                        
                        ${pedido.direccion !== 'Retiro en local' ? `
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 20px;">
                            <tr>
                              <td>
                                <p style="margin: 0 0 8px; font-size: 15px; color: #555555; font-weight: 600;">
                                  📍 Dirección de Envío:
                                </p>
                                <p style="margin: 0; font-size: 14px; color: #666666; line-height: 1.6;">
                                  ${pedido.direccion}
                                </p>
                              </td>
                            </tr>
                          </table>
                        ` : `
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 20px;">
                            <tr>
                              <td>
                                <p style="margin: 0 0 8px; font-size: 15px; color: #555555; font-weight: 600;">
                                  🏪 Tipo de Entrega:
                                </p>
                                <p style="margin: 0; font-size: 14px; color: #4CAF50; font-weight: 600;">
                                  Retiro en Local
                                </p>
                              </td>
                            </tr>
                          </table>
                        `}
                        
                        ${pedido.notasCliente ? `
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 20px;">
                            <tr>
                              <td>
                                <p style="margin: 0 0 8px; font-size: 15px; color: #555555; font-weight: 600;">
                                  📝 Notas:
                                </p>
                                <p style="margin: 0; font-size: 14px; color: #666666; line-height: 1.6;">
                                  ${pedido.notasCliente}
                                </p>
                              </td>
                            </tr>
                          </table>
                        ` : ''}
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #374151;">
                    Si tienes alguna pregunta, no dudes en contactarnos.
                  </p>
                </td>
              </tr>
              
              <tr>
                <td style="background-color: ${EMAIL_CONFIG.brandColor}; padding: 35px 40px; text-align: center;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="text-align: center;">
                        <p style="margin: 0 0 12px; font-size: 16px; color: #FFE4B5; font-weight: 700; letter-spacing: 0.5px;">
                          💬 ¿Tienes alguna consulta o deseas cancelar tu orden?
                        </p>
                        <p style="margin: 0 0 12px; font-size: 15px; line-height: 1.6; color: #F5DEB3; font-weight: 500;">
                          Estamos para ayudarte. Contáctanos:
                        </p>
                        <p style="margin: 0; font-size: 17px; line-height: 1.8; color: #FFFFFF; font-weight: 700;">
                          📱 WhatsApp: <a href="https://wa.me/50683195781" style="color: #FFD700; font-weight: 700; text-decoration: none;">+506 8319-5781</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <tr>
                <td style="background-color: ${EMAIL_CONFIG.lightBg}; padding: 35px 40px; text-align: center; border-top: 2px solid ${EMAIL_CONFIG.accentColor};">
                  <p style="margin: 0 0 10px; font-family: Georgia, serif; font-size: 22px; font-weight: 700; color: #2C1810; letter-spacing: 2px;">
                    ARALIS
                  </p>
                  <p style="margin: 0 0 8px; font-size: 14px; color: #5D4037; font-style: italic; font-weight: 600;">
                    Tu Estilo, Nuestra Inspiración
                  </p>
                  <p style="margin: 0 0 15px; font-size: 14px; color: #666666; font-weight: 600;">
                    Tacacori, Alajuela, Costa Rica
                  </p>
                  <p style="margin: 0; font-size: 13px; color: #888888; font-weight: 500;">
                    © ${new Date().getFullYear()} Aralis. Todos los derechos reservados.
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

function generarHTMLCambioEstado(pedido: any, nuevoEstado: string): string {
  // Configuración de colores y mensajes según cada estado
  const estadoConfig: Record<string, { emoji: string; color: string; bgColor: string; titulo: string; mensaje: string }> = {
    'pendiente': {
      emoji: '⏳',
      color: '#C9A96E',
      bgColor: '#F8F6F0',
      titulo: 'Pedido Pendiente',
      mensaje: 'Tu pedido está siendo revisado. Te contactaremos pronto para confirmar los detalles.'
    },
    'pagado': {
      emoji: '💳',
      color: '#4CAF50',
      bgColor: '#F8F6F0',
      titulo: 'Pago Confirmado',
      mensaje: '¡Confirmamos tu pago! Tu pedido se procesará pronto.'
    },
    'en preparación': {
      emoji: '🎨',
      color: '#8B7355',
      bgColor: '#F8F6F0',
      titulo: 'En Preparación',
      mensaje: 'Estamos trabajando en tu pedido con mucho cuidado.'
    },
    'enviado': {
      emoji: '📦',
      color: '#5B9BD5',
      bgColor: '#F8F6F0',
      titulo: 'Pedido Enviado',
      mensaje: 'Tu pedido está en camino. ¡Pronto lo recibirás!'
    },
    'entregado': {
      emoji: '✅',
      color: '#4CAF50',
      bgColor: '#F8F6F0',
      titulo: 'Pedido Entregado',
      mensaje: '¡Tu pedido fue entregado! Esperamos que disfrutes tu compra.'
    },
    'cancelado': {
      emoji: '❌',
      color: '#D32F2F',
      bgColor: '#F8F6F0',
      titulo: 'Pedido Cancelado',
      mensaje: 'Tu pedido fue cancelado. Si tienes dudas, contáctanos.'
    }
  }

  const config = estadoConfig[nuevoEstado.toLowerCase()] || estadoConfig['pendiente']

  // HTML de los productos
  const productosHTML = pedido.productos?.map((prod: any) => `
    <div style="padding: 15px 0; border-bottom: 1px solid #E8E6DD;">
      <div style="font-weight: 600; color: #2C1810; margin-bottom: 6px; font-size: 15px;">${prod.nombre}</div>
      ${prod.sku ? `<div style="font-size: 13px; color: #888888; margin-bottom: 3px; font-family: 'Courier New', monospace;">${prod.sku}</div>` : ''}
      ${prod.color ? `<div style="font-size: 14px; color: #666666; margin-bottom: 3px;">Color: ${prod.color}</div>` : ''}
      ${prod.talla ? `<div style="font-size: 14px; color: #666666; margin-bottom: 3px;">Talla: ${prod.talla}</div>` : ''}
      <div style="font-size: 14px; color: #666666;">Cantidad: ${prod.cantidad}</div>
    </div>
  `).join('') || ''

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Actualización de Pedido</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F5F5F5;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F5F5F5;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              
              <tr>
                <td style="background-color: #FFFFFF; padding: 40px 40px 30px; text-align: center; border-bottom: 2px solid #E8E6DD;">
                  <h1 style="margin: 0 0 8px; font-family: Georgia, serif; font-size: 32px; font-weight: 700; color: #2C1810; letter-spacing: 3px;">
                    ARALIS
                  </h1>
                  <p style="margin: 0; font-size: 13px; color: #5D4037; font-style: italic; font-weight: 600; letter-spacing: 1px;">
                    CREATIVIDAD A TU MEDIDA
                  </p>
                </td>
              </tr>
              
              <tr>
                <td style="background-color: ${config.bgColor}; padding: 30px 40px; text-align: center;">
                  <div style="display: inline-block; background-color: ${config.color}; padding: 18px 40px; border-radius: 50px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                    <span style="font-size: 28px; vertical-align: middle; margin-right: 10px;">${config.emoji}</span>
                    <span style="color: #FFFFFF; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; vertical-align: middle;">
                      ${config.titulo}
                    </span>
                  </div>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 40px 40px 35px; background-color: #FFFFFF;">
                  <p style="margin: 0 0 8px; font-size: 15px; color: #666666; font-weight: 500;">
                    Hola,
                  </p>
                  <h2 style="margin: 0 0 25px; font-size: 26px; color: #2C1810; font-weight: 700; line-height: 1.3;">
                    ${pedido.userName || pedido.nombreCliente || 'Cliente'}
                  </h2>
                  
                  <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.7; color: #333333; font-weight: 500;">
                    ${config.mensaje}
                  </p>
                  
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F8F6F0; border-radius: 8px; padding: 25px; margin-bottom: 30px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
                    <tr>
                      <td>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                          <tr>
                            <td style="padding: 0 0 18px 0; border-bottom: 2px solid ${config.color};">
                              <p style="margin: 0; font-size: 13px; color: #666666; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                                📋 Información del Pedido
                              </p>
                            </td>
                          </tr>
                        </table>
                        
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 18px; margin-bottom: 20px;">
                          <tr>
                            <td style="padding: 8px 0;">
                              <span style="font-size: 14px; color: #555555; font-weight: 600;">Número de Pedido:</span>
                            </td>
                            <td style="padding: 8px 0; text-align: right;">
                              <span style="font-size: 15px; color: #2C1810; font-weight: 700; font-family: 'Courier New', monospace;">${pedido.numeroPedido}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0;">
                              <span style="font-size: 14px; color: #555555; font-weight: 600;">Estado Actual:</span>
                            </td>
                            <td style="padding: 8px 0; text-align: right;">
                              <span style="display: inline-block; background-color: ${config.color}; color: #FFFFFF; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 700;">
                                ${nuevoEstado.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        </table>

                        ${productosHTML ? `
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="padding: 18px 0 12px 0; border-top: 2px solid #E8E6DD;">
                                <p style="margin: 0; font-size: 15px; color: #555555; font-weight: 600;">
                                  Productos:
                                </p>
                              </td>
                            </tr>
                          </table>
                          ${productosHTML}
                        ` : ''}
                        
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 20px; padding-top: 20px; border-top: 2px solid ${config.color};">
                          <tr>
                            <td style="padding: 8px 0;">
                              <span style="font-size: 16px; color: #555555; font-weight: 600;">Total:</span>
                            </td>
                            <td style="padding: 8px 0; text-align: right;">
                              <span style="font-size: 20px; color: #2C1810; font-weight: 700;">₡${pedido.total.toLocaleString('es-CR')}</span>
                            </td>
                          </tr>
                        </table>

                        ${pedido.direccion && pedido.direccion !== 'Retiro en local' ? `
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 20px;">
                            <tr>
                              <td>
                                <p style="margin: 0 0 8px; font-size: 15px; color: #555555; font-weight: 600;">
                                  📍 Dirección de Envío:
                                </p>
                                <p style="margin: 0; font-size: 14px; color: #666666; line-height: 1.6;">
                                  ${pedido.direccion}
                                </p>
                              </td>
                            </tr>
                          </table>
                        ` : pedido.direccion === 'Retiro en local' ? `
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 20px;">
                            <tr>
                              <td>
                                <p style="margin: 0 0 8px; font-size: 15px; color: #555555; font-weight: 600;">
                                  🏪 Tipo de Entrega:
                                </p>
                                <p style="margin: 0; font-size: 14px; color: #4CAF50; font-weight: 600;">
                                  Retiro en Local
                                </p>
                              </td>
                            </tr>
                          </table>
                        ` : ''}

                        ${pedido.notasCliente ? `
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 20px;">
                            <tr>
                              <td>
                                <p style="margin: 0 0 8px; font-size: 15px; color: #555555; font-weight: 600;">
                                  📝 Notas:
                                </p>
                                <p style="margin: 0; font-size: 14px; color: #666666; line-height: 1.6;">
                                  ${pedido.notasCliente}
                                </p>
                              </td>
                            </tr>
                          </table>
                        ` : ''}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <tr>
                <td style="background-color: #5D4037; padding: 35px 40px; text-align: center;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="text-align: center;">
                        <p style="margin: 0 0 12px; font-size: 16px; color: #FFE4B5; font-weight: 700; letter-spacing: 0.5px;">
                          💬 ¿Tienes preguntas?
                        </p>
                        <p style="margin: 0 0 12px; font-size: 15px; line-height: 1.6; color: #F5DEB3; font-weight: 500;">
                          Estamos para ayudarte. Contáctanos:
                        </p>
                        <p style="margin: 0; font-size: 17px; line-height: 1.8; color: #FFFFFF; font-weight: 700;">
                          📱 WhatsApp: <a href="https://wa.me/50683195781" style="color: #FFD700; font-weight: 700; text-decoration: none;">+506 8319-5781</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <tr>
                <td style="background-color: #F8F6F0; padding: 35px 40px; text-align: center; border-top: 2px solid #C9A96E;">
                  <p style="margin: 0 0 10px; font-family: Georgia, serif; font-size: 22px; font-weight: 700; color: #2C1810; letter-spacing: 2px;">
                    ARALIS
                  </p>
                  <p style="margin: 0 0 8px; font-size: 14px; color: #5D4037; font-style: italic; font-weight: 600;">
                    Tu Estilo, Nuestra Inspiración
                  </p>
                  <p style="margin: 0 0 15px; font-size: 14px; color: #666666; font-weight: 600;">
                    Tacacori, Alajuela, Costa Rica
                  </p>
                  <p style="margin: 0; font-size: 13px; color: #888888; font-weight: 500;">
                    © ${new Date().getFullYear()} Aralis. Todos los derechos reservados.
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

// Versiones texto plano (para clientes de email sin HTML)

function generarTextoPlanoRecuperacion(resetUrl: string): string {
  return `
RECUPERAR CONTRASEÑA - ${EMAIL_CONFIG.brandName}

Hola,

Recibimos una solicitud para restablecer la contraseña de tu cuenta.

Para crear una nueva contraseña, visita este enlace:
${resetUrl}

⚠️ IMPORTANTE:
- Este enlace expira en 1 hora
- Solo se puede usar una vez
- Si no solicitaste este cambio, comunícate con Aralis de inmediato
- Tu contraseña actual sigue siendo válida hasta que la cambies

---
${EMAIL_CONFIG.brandName} - Prendas Personalizadas
WhatsApp: ${EMAIL_CONFIG.whatsapp}
  `.trim()
}

function generarTextoPlanoConfirmacionCambio(nombre?: string): string {
  return `
CONTRASEÑA ACTUALIZADA - ${EMAIL_CONFIG.brandName}

${nombre ? `Hola ${nombre},` : 'Hola,'}

Tu contraseña se actualizó correctamente.

Ya puedes iniciar sesión en ${EMAIL_CONFIG.brandName} con tu nueva contraseña.

🔒 AVISO DE SEGURIDAD:
Si no fuiste tú quien realizó este cambio, comunícate con Aralis de inmediato

---
${EMAIL_CONFIG.brandName} - Prendas Personalizadas
WhatsApp: ${EMAIL_CONFIG.whatsapp}
  `.trim()
}

function generarTextoplanoCambioPerfil(
  nombre: string,
  cambios: {
    nombreAnterior?: string,
    nombreNuevo?: string,
    emailAnterior?: string,
    emailNuevo?: string
  }
): string {
  const cambioNombre = cambios.nombreAnterior && cambios.nombreNuevo
  const cambioEmail = cambios.emailAnterior && cambios.emailNuevo
  
  let cambiosTexto = ''
  if (cambioNombre) cambiosTexto += `- Nombre: ${cambios.nombreNuevo}\n`
  if (cambioEmail) cambiosTexto += `- Correo electrónico: ${cambios.emailNuevo}\n`
  
  return `
PERFIL ACTUALIZADO - ${EMAIL_CONFIG.brandName}

Hola ${nombre},

Tu perfil en ${EMAIL_CONFIG.brandName} se actualizó correctamente.

CAMBIOS REALIZADOS:
${cambiosTexto}
${cambioEmail ? `\nIMPORTANTE: Ahora debes usar tu nuevo correo (${cambios.emailNuevo}) para iniciar sesión.\n` : ''}
🔒 AVISO DE SEGURIDAD:
Si no fuiste tú quien realizó este cambio, comunícate con Aralis de inmediato

---
${EMAIL_CONFIG.brandName} - Prendas Personalizadas
WhatsApp: ${EMAIL_CONFIG.whatsapp}
  `.trim()
}

function generarTextoplanoBienvenida(nombre: string): string {
  return `
¡BIENVENIDO A ARALIS!

Hola ${nombre},

Gracias por crear tu cuenta en Aralis. Nos alegra tenerte con nosotros.

Ahora puedes disfrutar de:
✨ Prendas personalizadas a tu medida
📦 Seguimiento de pedidos en tiempo real
🎨 Acceso a colecciones exclusivas

Explora nuestro catálogo: ${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/catalogo

¿Tienes alguna pregunta?
📱 WhatsApp: ${EMAIL_CONFIG.whatsapp}

---
${EMAIL_CONFIG.brandName} - Tu Estilo, Nuestra Inspiración
Tacacori, Alajuela, Costa Rica
  `.trim()
}

function generarTextoplanoPedido(pedido: any): string {
  // Lista de productos con sus detalles
  const productos = pedido.productos.map((prod: any) => {
    let linea = `- ${prod.nombre}`
    if (prod.sku) linea += ` [${prod.sku}]`
    if (prod.color) linea += ` (${prod.color})`
    if (prod.talla) linea += ` - Talla ${prod.talla}`
    linea += `\n  Cantidad: ${prod.cantidad} | Subtotal: ₡${prod.subtotal.toLocaleString('es-CR')}`
    return linea
  }).join('\n')

  return `
CONFIRMACIÓN DE PEDIDO #${pedido.numeroPedido}

Hola ${pedido.nombreCliente},

Recibimos tu pedido y lo estamos procesando.

DETALLES DEL PEDIDO:
Número: ${pedido.numeroPedido}
Fecha: ${new Date(pedido.fechaPedido).toLocaleDateString('es-CR')}

PRODUCTOS:
${productos}

TOTAL: ₡${pedido.total.toLocaleString('es-CR')}

${pedido.direccion !== 'Retiro en local' ? `DIRECCIÓN DE ENVÍO:\n${pedido.direccion}` : 'TIPO DE ENTREGA: Retiro en Local'}

${pedido.notasCliente ? `NOTAS:\n${pedido.notasCliente}` : ''}

Nos pondremos en contacto contigo pronto para confirmar tu pedido.

---
${EMAIL_CONFIG.brandName} - Prendas Personalizadas
WhatsApp: ${EMAIL_CONFIG.whatsapp}
  `.trim()
}

function generarTextoplanoCambioEstado(pedido: any, nuevoEstado: string): string {
  // Mensajes según el estado
  const estadoMensajes: Record<string, string> = {
    'pendiente': 'Tu pedido está siendo revisado. Te contactaremos pronto para confirmar los detalles.',
    'pagado': '¡Confirmamos tu pago! Tu pedido se procesará pronto.',
    'en preparación': 'Estamos trabajando en tu pedido con mucho cuidado.',
    'enviado': 'Tu pedido está en camino. ¡Pronto lo recibirás!',
    'entregado': '¡Tu pedido fue entregado! Esperamos que disfrutes tu compra.',
    'cancelado': 'Tu pedido fue cancelado. Si tienes dudas, contáctanos.'
  }

  const mensaje = estadoMensajes[nuevoEstado.toLowerCase()] || estadoMensajes['pendiente']

  return `
ACTUALIZACIÓN DE PEDIDO #${pedido.numeroPedido}

Hola ${pedido.userName || pedido.nombreCliente || 'Cliente'},

${mensaje}

INFORMACIÓN DEL PEDIDO:
Número: ${pedido.numeroPedido}
Estado Actual: ${nuevoEstado.toUpperCase()}
Total: ₡${pedido.total.toLocaleString('es-CR')}

¿Tienes preguntas?
Contáctanos por WhatsApp: ${EMAIL_CONFIG.whatsapp}

---
${EMAIL_CONFIG.brandName} - Prendas Personalizadas
WhatsApp: ${EMAIL_CONFIG.whatsapp}
  `.trim()
}