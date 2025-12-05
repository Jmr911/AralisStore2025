import Link from "next/link"
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  const whatsappNumber = "50683195781"
  const whatsappMessage = encodeURIComponent("Hola, Aralis. Estoy interesado en obtener más información. ¿Podrían contactarme, por favor?")

  return (
    <footer className="bg-primary text-primary-foreground py-3 md:py-4">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-4 mb-2">
          <div>
            <h3 className="font-serif text-sm font-bold mb-1">Aralis</h3>
            <p className="text-xs opacity-90 leading-snug">
              Creatividad a tu medida. Confección personalizada.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-1 text-sm">Navegación</h4>
            <ul className="space-y-1 text-xs">
              <li>
                <Link href="/catalogo" className="opacity-90 hover:opacity-100 transition-opacity">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/personalizar" className="opacity-90 hover:opacity-100 transition-opacity">
                  Personalizar
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="opacity-90 hover:opacity-100 transition-opacity">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-1 text-sm">Contacto</h4>
            <ul className="space-y-1 text-xs">
              <li className="flex items-start gap-2 opacity-90">
                <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <a 
                  href="https://maps.app.goo.gl/DZgQiJNQQu5jTSWo9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-100 hover:underline transition-opacity"
                >
                  Tacacori, Alajuela, Costa Rica
                </a>
              </li>
              <li className="flex items-center gap-2 opacity-90">
                <Phone className="h-3 w-3 flex-shrink-0" />
                <a 
                  href="tel:+50683195781"
                  className="hover:opacity-100 hover:underline transition-opacity"
                >
                  +506 8319-5781
                </a>
              </li>
              <li className="flex items-center gap-2 opacity-90">
                <Mail className="h-3 w-3 flex-shrink-0" />
                <a 
                  href="mailto:AralisModa@hotmail.com"
                  className="hover:opacity-100 hover:underline transition-opacity"
                >
                  AralisModa@hotmail.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-1 text-sm">Síguenos</h4>
            <div className="flex gap-3">
              <a 
                href="https://www.facebook.com/profile.php?id=61571172749832"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-90 hover:opacity-100 transition-opacity"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href="https://www.instagram.com/aralis.cr/"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-90 hover:opacity-100 transition-opacity"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-90 hover:opacity-100 transition-opacity"
                aria-label="WhatsApp"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-2 text-center text-xs opacity-90">
          <p>&copy; {new Date().getFullYear()} Aralis. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}