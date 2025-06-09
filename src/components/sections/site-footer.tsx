"use client"
import Link from "next/link"
import { 
  Instagram, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  Truck, 
  Landmark,
  Banknote
} from "lucide-react"

export function SiteFooter() {
  const handleWhatsAppAri = () => {
    const phoneNumber = "5493513153203";
    const message = "¡Hola Ari! Vengo de la web y ...";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleWhatsAppGuille = () => {
    const phoneNumber = "5493513705773";
    const message = "¡Hola Guille! Vengo de la web y ...";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="container px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="font-serif text-2xl font-bold text-white">
              NARGUILAS<span className="text-primary">CÓRDOBA</span>
            </Link>
            <p className="mt-4 text-gray-400 text-sm">
              Narguilas de alta calidad para el aficionado. Elevá tu experiencia.
            </p>
            <div className="flex space-x-4 mt-6">
              <Link 
                href="https://instagram.com/narguilascordoba" 
                target="_blank"
                className="text-gray-400 hover:text-primary transition-colors"
                aria-label="Seguinos en Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-white font-medium mb-4">Tienda</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/tienda?category=narguilas" className="text-gray-400 hover:text-primary text-sm transition-colors">
                  Narguilas
                </Link>
              </li>
              <li>
                <Link href="/tienda?category=tabaco" className="text-gray-400 hover:text-primary text-sm transition-colors">
                  Tabaco
                </Link>
              </li>
              <li>
                <Link href="/tienda?category=accesorios" className="text-gray-400 hover:text-primary text-sm transition-colors">
                  Accesorios
                </Link>
              </li>
              <li>
                <Link href="/tienda?new=true" className="text-gray-400 hover:text-primary text-sm transition-colors">
                  Nuevos
                </Link>
              </li>
              <li>
                <Link href="/tienda?bestseller=true" className="text-gray-400 hover:text-primary text-sm transition-colors">
                  Más vendidos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-medium mb-4">Empresa</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/nosotros" className="text-gray-400 hover:text-primary text-sm transition-colors">
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link href="/eventos" className="text-gray-400 hover:text-primary text-sm transition-colors">
                  Eventos
                </Link>
              </li>
              <li>
                <Link href="/distribuidores" className="text-gray-400 hover:text-primary text-sm transition-colors">
                  Distribuidores
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-medium mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary" />
                <button 
                  onClick={handleWhatsAppAri}
                  className="text-gray-400 hover:text-primary text-sm transition-colors cursor-pointer"
                  aria-label="Contactar a Ari por WhatsApp"
                >
                  Ari: 351 315-3203
                </button>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary" />
                <button 
                  onClick={handleWhatsAppGuille}
                  className="text-gray-400 hover:text-primary text-sm transition-colors cursor-pointer"
                  aria-label="Contactar a Guille por WhatsApp"
                >
                  Guille: 351 370-5773
                </button>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary" />
                <a 
                  href="mailto:nargui.cba@gmail.com" 
                  className="text-gray-400 hover:text-primary text-sm transition-colors"
                >
                  nargui.cba@gmail.com
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-gray-400 text-sm">
                  Córdoba, Argentina
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-medium mb-4">Medios de Pago</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <span className="text-gray-400 text-sm">Tarjetas</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-800 rounded p-1 text-center aspect-square">
                    <img src="/VISA-Logo.png" alt="Visa" className="aspect-square object-contain" />
                  </div>
                  <div className="bg-gray-800 rounded p-1 text-center aspect-square">
                    <img src="/mc-logo.png" alt="Visa" className="aspect-square object-contain" />
                  </div>
                  <div className="bg-gray-800 rounded p-1 text-center aspect-square">
                    <img src="/amex-logo.png" alt="Visa" className="aspect-square object-contain" />
                  </div>
                  <div className="bg-gray-800 rounded p-1 text-center aspect-square">
                    <img src="/mp-logo.png" alt="Visa" className="aspect-square object-contain" />
                  </div>
                  <div className="bg-gray-800 rounded p-1 grid place-content-center aspect-square">
                    <Landmark className="size-10 text-white" />
                  </div>
                  <div className="bg-gray-800 rounded p-1 grid place-content-center aspect-square">
                    <Banknote className="size-10 text-white" />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Truck className="h-4 w-4 text-primary" />
                  <span className="text-gray-400 text-sm">Envíos</span>
                </div>
                <div className="space-y-1">
                  <div className="bg-gray-800 rounded p-2 text-center w-full">
                    <img src="/andreani-logo.png" alt="Visa" className="object-contain" />
                  </div>
                  <p className="text-xs text-gray-500">
                    Gratis superando $110.000
                  </p>
                  <p className="text-xs text-gray-500">
                    A cualquier sucursal Andreani
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            &copy; 2025 Narguilas Córdoba. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
