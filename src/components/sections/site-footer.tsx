import Link from "next/link"
import { Instagram, Facebook, Twitter } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="container px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="font-serif text-2xl font-bold text-white">
              NARGUILAS<span className="text-primary">CÓRDOBA</span>
            </Link>
            <p className="mt-4 text-gray-400 text-sm">
              Narguilas de alta calidad para el aficionado. Elevate tu experiencia.
            </p>
            <div className="flex space-x-4 mt-6">
              <Link href="#" className="text-gray-400 hover:text-primary">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-primary">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-primary">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-white font-medium mb-4">Tienda</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary text-sm">
                  Narguilas
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary text-sm">
                  Tabaco
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary text-sm">
                  Accesorios
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary text-sm">
                  Nuevos
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary text-sm">
                  Mas vendidos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-medium mb-4">Eventos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary text-sm">
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary text-sm">
                  Eventos
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Narguilas Córdoba. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
