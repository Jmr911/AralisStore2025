// lib/email.ts
import { Resend } from 'resend'

// Inicializamos el servicio de Resend con nuestra API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Configuración centralizada de todos los emails de Aralis
const EMAIL_CONFIG = {
  from: 'Aralis <onboarding@resend.dev>', 
  brandColor: '#5D4037', // Marrón chocolate
  accentColor: '#C9A96E', // Dorado suave
  lightBg: '#F8F6F0', // Crema/beige claro
  brandName: 'Aralis',
  supportEmail: 'jmr91_@hotmail.com',
  whatsapp: '+506 8319-5781'
}

// ============================================
// 📧 EMAIL DE RECUPERACIÓN DE CONTRASEÑA
// ============================================
// Envía un email con un enlace para que el usuario pueda crear una nueva contraseña
export async function enviarEmailRecuperacion(email: string, token: string) {
  try {
    // Construimos la URL completa con el token para restablecer
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/restablecer-contrasena?token=${token}`
    
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: email,
      subject: '🔐 Recuperar Contraseña - Aralis',
      html: generarHTMLRecuperacion(resetUrl),
      text: generarTextoPlanoRecuperacion(resetUrl)
    })

    if (error) {
      console.error('❌ Error enviando email de recuperación:', error)
      return { success: false, error: error.message || 'Error al enviar email' }
    }

    console.log('✅ Email de recuperación enviado correctamente a:', email)
    console.log('📬 ID del email:', data?.id)
    return { success: true, data }

  } catch (error) {
    console.error('❌ Excepción al enviar email de recuperación:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido al enviar email'
    }
  }
}

// ============================================
// 🎉 EMAIL DE CONFIRMACIÓN DE CAMBIO DE CONTRASEÑA
// ============================================
// Notifica al usuario que su contraseña fue actualizada correctamente
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
      console.error('❌ Error enviando confirmación de cambio:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Confirmación de cambio enviada a:', email)
    return { success: true, data }

  } catch (error) {
    console.error('❌ Excepción al enviar confirmación:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// ============================================
// 👤 EMAIL DE CONFIRMACIÓN DE CAMBIO DE PERFIL
// ============================================
// Notifica al usuario cuando actualiza su nombre o correo electrónico
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
      console.error('❌ Error enviando confirmación de cambio de perfil:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Confirmación de cambio de perfil enviada a:', emailDestino)
    return { success: true, data }

  } catch (error) {
    console.error('❌ Excepción al enviar confirmación de cambio de perfil:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// ============================================
// 🎉 EMAIL DE BIENVENIDA AL REGISTRARSE
// ============================================
// Da la bienvenida a los nuevos usuarios cuando crean su cuenta
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
      console.error('❌ Error enviando email de bienvenida:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Email de bienvenida enviado a:', email)
    return { success: true, data }

  } catch (error) {
    console.error('❌ Excepción al enviar email de bienvenida:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// ============================================
// 📧 EMAIL DE CONFIRMACIÓN DE PEDIDO
// ============================================
// Confirma al cliente que recibimos su pedido y lo estamos procesando
export async function enviarEmailPedido(pedido: any) {
  try {
    // Generamos el HTML de cada producto con sus detalles (SKU, color, talla)
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
      console.error('❌ Error enviando email de pedido:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Email de pedido enviado a:', pedido.email)
    console.log('📦 Pedido #:', pedido.numeroPedido)
    console.log('⚠️ NOTA: Copia a propietarias desactivada (requiere dominio verificado)')
    return { success: true, data }

  } catch (error) {
    console.error('❌ Excepción al enviar email de pedido:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// ============================================
// 🔄 EMAIL DE ACTUALIZACIÓN DE ESTADO DE PEDIDO
// ============================================
// Notifica al cliente cuando cambia el estado de su pedido (pagado, en preparación, enviado, etc)
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
      console.error('❌ Error enviando email de cambio de estado:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Email de cambio de estado enviado a:', pedido.userEmail || pedido.email)
    console.log('📦 Pedido #:', pedido.numeroPedido)
    console.log('🔄 Nuevo estado:', nuevoEstado)
    console.log('⚠️ NOTA: Copia a propietarias desactivada (requiere dominio verificado)')
    return { success: true, data }

  } catch (error) {
    console.error('❌ Excepción al enviar email de cambio de estado:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// ============================================
// 🎨 PLANTILLAS HTML
// ============================================

// Plantilla HTML para email de recuperación de contraseña
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
              
              <!-- Header -->
              <tr>
                <td style="background-color: ${EMAIL_CONFIG.brandColor}; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                    🔐 Recuperar Contraseña
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                    Hola,
                  </p>
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                    Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>${EMAIL_CONFIG.brandName}</strong>.
                  </p>
                  <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #374151;">
                    Haz clic en el siguiente botón para crear una nueva contraseña:
                  </p>
                  
                  <!-- Button -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="padding: 0 0 30px;">
                        <a href="${resetUrl}" style="display: inline-block; background-color: ${EMAIL_CONFIG.brandColor}; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 6px; text-align: center;">
                          Restablecer Contraseña
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Warning Box -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 30px;">
                    <tr>
                      <td style="padding: 20px;">
                        <p style="margin: 0 0 10px; font-size: 14px; font-weight: 600; color: #92400e;">
                          ⚠️ Importante:
                        </p>
                        <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 1.6;">
                          <li>Este enlace expirará en <strong>1 hora</strong></li>
                          <li>Solo se puede usar <strong>una vez</strong></li>
                          <li>Si no solicitaste este cambio, comunícate con <strong>Aralis</strong> inmediatamente</li>
                          <li>Tu contraseña actual seguirá siendo válida hasta que la cambies</li>
                        </ul>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Alternative Link -->
                  <p style="margin: 0 0 10px; font-size: 14px; line-height: 1.6; color: #6b7280;">
                    Si el botón no funciona, copia y pega este enlace en tu navegador:
                  </p>
                  <p style="margin: 0; font-size: 14px; word-break: break-all; color: #3b82f6;">
                    <a href="${resetUrl}" style="color: #3b82f6; text-decoration: none;">${resetUrl}</a>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
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

// Plantilla HTML para confirmación de cambio de contraseña
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
              
              <!-- Header -->
              <tr>
                <td style="background-color: #10b981; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                    ✅ Contraseña Actualizada
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                    ${nombre ? `Hola ${nombre},` : 'Hola,'}
                  </p>
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                    Tu contraseña ha sido <strong>actualizada exitosamente</strong>.
                  </p>
                  <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #374151;">
                    Ya puedes iniciar sesión en ${EMAIL_CONFIG.brandName} con tu nueva contraseña.
                  </p>
                  
                  <!-- Security Notice -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
                    <tr>
                      <td style="padding: 20px;">
                        <p style="margin: 0 0 10px; font-size: 14px; font-weight: 600; color: #991b1b;">
                          🔒 Aviso de Seguridad:
                        </p>
                        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #991b1b;">
                          Si <strong>NO</strong> realizaste este cambio, contacta inmediatamente con nuestro soporte en 
                          <a href="https://wa.me/50683195781" style="color: #991b1b; font-weight: 600;">${EMAIL_CONFIG.whatsapp}</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
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

// Plantilla HTML para email de cambio de perfil (nombre o correo)
function generarHTMLCambioPerfil(
  nombre: string,
  cambios: {
    nombreAnterior?: string,
    nombreNuevo?: string,
    emailAnterior?: string,
    emailNuevo?: string
  }
): string {
  // Determinamos qué cambió para mostrarlo en el email
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
              
              <!-- Header -->
              <tr>
                <td style="background-color: #3b82f6; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                    ✅ Perfil Actualizado
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                    Hola ${nombre},
                  </p>
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                    Tu perfil en <strong>${EMAIL_CONFIG.brandName}</strong> ha sido actualizado exitosamente.
                  </p>
                  
                  <!-- Cambios realizados -->
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
                      <strong>Importante:</strong> A partir de ahora deberás usar tu correo electrónico (${cambios.emailNuevo}) para iniciar sesión.
                    </p>
                  ` : ''}
                  
                  <!-- Security Notice -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
                    <tr>
                      <td style="padding: 20px;">
                        <p style="margin: 0 0 10px; font-size: 14px; font-weight: 600; color: #991b1b;">
                          🔒 Aviso de Seguridad:
                        </p>
                        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #991b1b;">
                          Si <strong>NO</strong> realizaste este cambio, contacta inmediatamente con nuestro soporte en 
                          <a href="https://wa.me/50683195781" style="color: #991b1b; font-weight: 600;">${EMAIL_CONFIG.whatsapp}</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
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

// Plantilla HTML para email de bienvenida
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
              
              <!-- Header con logo -->
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
              
              <!-- Mensaje de bienvenida -->
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
              
              <!-- Contenido principal -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.7; color: #333333;">
                    Gracias por crear tu cuenta en <strong>Aralis</strong>. Estamos emocionados de tenerte con nosotros.
                  </p>
                  <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.7; color: #333333;">
                    Ahora puedes disfrutar de:
                  </p>
                  
                  <!-- Lista de beneficios -->
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
                  
                  <!-- Botón CTA -->
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
              
              <!-- Sección de contacto -->
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
              
              <!-- Footer -->
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

// Plantilla HTML para confirmación de pedido (esta función es larga por el HTML detallado)
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
              
              <!-- Header -->
              <tr>
                <td style="background-color: #5D4037; padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                  <h1 style="margin: 0; color: #FFFFFF; font-size: 28px; font-weight: 700; letter-spacing: 1px;">
                    🎉¡Gracias por tu compra en Aralis!
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 8px; font-size: 15px; color: #666666; font-weight: 500;">
                    Hola,
                  </p>
                  <h2 style="margin: 0 0 25px; font-size: 26px; color: #2C1810; font-weight: 700; line-height: 1.3;">
                    ${pedido.nombreCliente}
                  </h2>
                  <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.7; color: #333333; font-weight: 500;">
                    Hemos recibido tu pedido y lo estamos procesando. Te contactaremos pronto para confirmar los detalles.
                  </p>
                  
                  <!-- Order Details Box -->
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
              
              <!-- Footer de Contacto -->
              <tr>
                <td style="background-color: ${EMAIL_CONFIG.brandColor}; padding: 35px 40px; text-align: center;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="text-align: center;">
                        <p style="margin: 0 0 12px; font-size: 16px; color: #FFE4B5; font-weight: 700; letter-spacing: 0.5px;">
                          💬 ¿Tienes alguna consulta o deseas cancelar tu orden?
                        </p>
                        <p style="margin: 0 0 12px; font-size: 15px; line-height: 1.6; color: #F5DEB3; font-weight: 500;">
                          Estamos aquí para ayudarte. Contáctanos:
                        </p>
                        <p style="margin: 0; font-size: 17px; line-height: 1.8; color: #FFFFFF; font-weight: 700;">
                          📱 WhatsApp: <a href="https://wa.me/50683195781" style="color: #FFD700; font-weight: 700; text-decoration: none;">+506 8319-5781</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer Principal -->
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

// Plantilla HTML para notificación de cambio de estado del pedido
function generarHTMLCambioEstado(pedido: any, nuevoEstado: string): string {
  // Configuramos colores y mensajes según el estado del pedido
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
      mensaje: '¡Hemos confirmado tu pago! Tu pedido será procesado pronto.'
    },
    'en preparación': {
      emoji: '🎨',
      color: '#8B7355',
      bgColor: '#F8F6F0',
      titulo: 'En Preparación',
      mensaje: 'Estamos trabajando en tu pedido con mucho cuidado y dedicación.'
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
      mensaje: '¡Tu pedido ha sido entregado! Esperamos que disfrutes tu compra.'
    },
    'cancelado': {
      emoji: '❌',
      color: '#D32F2F',
      bgColor: '#F8F6F0',
      titulo: 'Pedido Cancelado',
      mensaje: 'Tu pedido ha sido cancelado. Si tienes dudas, contáctanos.'
    }
  }

  const config = estadoConfig[nuevoEstado.toLowerCase()] || estadoConfig['pendiente']

  // Generamos HTML de productos si existen
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
              
              <!-- Header -->
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
              
              <!-- Estado Badge -->
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
              
              <!-- Contenido Principal -->
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
                  
                  <!-- Información del Pedido -->
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
              
              <!-- Footer de Contacto -->
              <tr>
                <td style="background-color: #5D4037; padding: 35px 40px; text-align: center;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="text-align: center;">
                        <p style="margin: 0 0 12px; font-size: 16px; color: #FFE4B5; font-weight: 700; letter-spacing: 0.5px;">
                          💬 ¿Tienes preguntas?
                        </p>
                        <p style="margin: 0 0 12px; font-size: 15px; line-height: 1.6; color: #F5DEB3; font-weight: 500;">
                          Estamos aquí para ayudarte. Contáctanos:
                        </p>
                        <p style="margin: 0; font-size: 17px; line-height: 1.8; color: #FFFFFF; font-weight: 700;">
                          📱 WhatsApp: <a href="https://wa.me/50683195781" style="color: #FFD700; font-weight: 700; text-decoration: none;">+506 8319-5781</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer Principal -->
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

// ============================================
// 📝 VERSIONES TEXTO PLANO (FALLBACK)
// ============================================
// Estas son versiones simples de los emails por si el cliente no soporta HTML

// Versión texto plano del email de recuperación
function generarTextoPlanoRecuperacion(resetUrl: string): string {
  return `
RECUPERAR CONTRASEÑA - ${EMAIL_CONFIG.brandName}

Hola,

Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.

Para crear una nueva contraseña, visita el siguiente enlace:
${resetUrl}

⚠️ IMPORTANTE:
- Este enlace expirará en 1 hora
- Solo se puede usar una vez
- Si no solicitaste este cambio, comunícate con Aralis inmediatamente
- Tu contraseña actual seguirá siendo válida hasta que la cambies

---
${EMAIL_CONFIG.brandName} - Prendas Personalizadas
WhatsApp: ${EMAIL_CONFIG.whatsapp}
  `.trim()
}

// Versión texto plano del email de confirmación de cambio de contraseña
function generarTextoPlanoConfirmacionCambio(nombre?: string): string {
  return `
CONTRASEÑA ACTUALIZADA - ${EMAIL_CONFIG.brandName}

${nombre ? `Hola ${nombre},` : 'Hola,'}

Tu contraseña ha sido actualizada exitosamente.

Ya puedes iniciar sesión en ${EMAIL_CONFIG.brandName} con tu nueva contraseña.

🔒 AVISO DE SEGURIDAD:
Si NO realizaste este cambio, comunícate con Aralis inmediatamente

---
${EMAIL_CONFIG.brandName} - Prendas Personalizadas
WhatsApp: ${EMAIL_CONFIG.whatsapp}
  `.trim()
}

// Versión texto plano del email de cambio de perfil
function generarTextoplanoCambioPerfil(
  nombre: string,
  cambios: {
    nombreAnterior?: string,
    nombreNuevo?: string,
    emailAnterior?: string,
    emailNuevo?: string
  }
): string {
  // Armamos la lista de cambios realizados
  const cambioNombre = cambios.nombreAnterior && cambios.nombreNuevo
  const cambioEmail = cambios.emailAnterior && cambios.emailNuevo
  
  let cambiosTexto = ''
  if (cambioNombre) cambiosTexto += `- Nombre: ${cambios.nombreNuevo}\n`
  if (cambioEmail) cambiosTexto += `- Correo electrónico: ${cambios.emailNuevo}\n`
  
  return `
PERFIL ACTUALIZADO - ${EMAIL_CONFIG.brandName}

Hola ${nombre},

Tu perfil en ${EMAIL_CONFIG.brandName} ha sido actualizado exitosamente.

CAMBIOS REALIZADOS:
${cambiosTexto}
${cambioEmail ? `\nIMPORTANTE: A partir de ahora deberás usar tu nuevo correo (${cambios.emailNuevo}) para iniciar sesión.\n` : ''}
🔒 AVISO DE SEGURIDAD:
Si NO realizaste este cambio, comunícate con Aralis inmediatamente

---
${EMAIL_CONFIG.brandName} - Prendas Personalizadas
WhatsApp: ${EMAIL_CONFIG.whatsapp}
  `.trim()
}

// Versión texto plano del email de bienvenida
function generarTextoplanoBienvenida(nombre: string): string {
  return `
¡BIENVENIDO A ARALIS!

Hola ${nombre},

Gracias por crear tu cuenta en Aralis. Estamos emocionados de tenerte con nosotros.

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

// Versión texto plano del email de confirmación de pedido
function generarTextoplanoPedido(pedido: any): string {
  // Incluimos el SKU en la versión texto plano también
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

Hemos recibido tu pedido y lo estamos procesando.

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

// Versión texto plano del email de cambio de estado
function generarTextoplanoCambioEstado(pedido: any, nuevoEstado: string): string {
  // Mensajes predefinidos según el estado
  const estadoMensajes: Record<string, string> = {
    'pendiente': 'Tu pedido está siendo revisado. Te contactaremos pronto para confirmar los detalles.',
    'pagado': '¡Hemos confirmado tu pago! Tu pedido será procesado pronto.',
    'en preparación': 'Estamos trabajando en tu pedido con mucho cuidado y dedicación.',
    'enviado': 'Tu pedido está en camino. ¡Pronto lo recibirás!',
    'entregado': '¡Tu pedido ha sido entregado! Esperamos que disfrutes tu compra.',
    'cancelado': 'Tu pedido ha sido cancelado. Si tienes dudas, contáctanos.'
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