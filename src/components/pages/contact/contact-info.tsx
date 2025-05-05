import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Instagram,
  Facebook,
  Twitter,
} from "lucide-react";

export function ContactInfo() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-6 font-serif text-2xl font-bold text-white">
          Información de Contacto
        </h2>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-gold-400" />
            <div>
              <h3 className="text-lg font-medium text-white">
                Tienda Principal
              </h3>
              <p className="text-gray-400">
                123 Calle Principal, Centro Comercial Luxury, Local 45
              </p>
              <p className="text-gray-400">Ciudad, CP 12345</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <Phone className="mt-1 h-5 w-5 flex-shrink-0 text-gold-400" />
            <div>
              <h3 className="text-lg font-medium text-white">Teléfono</h3>
              <p className="text-gray-400">+1 (555) 123-4567</p>
              <p className="text-gray-400">+1 (555) 987-6543</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <Mail className="mt-1 h-5 w-5 flex-shrink-0 text-gold-400" />
            <div>
              <h3 className="text-lg font-medium text-white">Email</h3>
              <p className="text-gray-400">info@luxuryhookah.com</p>
              <p className="text-gray-400">ventas@luxuryhookah.com</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <Clock className="mt-1 h-5 w-5 flex-shrink-0 text-gold-400" />
            <div>
              <h3 className="text-lg font-medium text-white">
                Horario de Atención
              </h3>
              <p className="text-gray-400">
                Lunes a Viernes: 10:00 AM - 8:00 PM
              </p>
              <p className="text-gray-400">Sábados: 11:00 AM - 6:00 PM</p>
              <p className="text-gray-400">Domingos: Cerrado</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium text-white">
          Síguenos en Redes Sociales
        </h3>
        <div className="flex space-x-4">
          <a
            href="#"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition-colors hover:bg-gold-500 hover:text-black"
          >
            <Instagram className="h-5 w-5" />
            <span className="sr-only">Instagram</span>
          </a>
          <a
            href="#"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition-colors hover:bg-gold-500 hover:text-black"
          >
            <Facebook className="h-5 w-5" />
            <span className="sr-only">Facebook</span>
          </a>
          <a
            href="#"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition-colors hover:bg-gold-500 hover:text-black"
          >
            <Twitter className="h-5 w-5" />
            <span className="sr-only">Twitter</span>
          </a>
        </div>
      </div>
    </div>
  );
}
