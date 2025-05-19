import { Sparkles, Users } from "lucide-react";

export const NuestraHistoria = () => {
  return (
    <section className="bg-black py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl font-bold text-white md:text-4xl">
            El Origen de <span className="text-gold-400">Narguilas Córdoba</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Todo gran viaje comienza con un primer paso. El nuestro nació de la
            amistad y el deseo de compartir una experiencia narguilera superior.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
          <div>
            {/* Replace with an actual image if available */}
            <img
              src="/placeholder.svg?height=400&width=600&text=Nuestros+Inicios"
              alt="Los inicios de Narguilas Córdoba"
              className="rounded-lg object-cover shadow-xl"
            />
          </div>
          <div className="space-y-6 text-gray-300">
            <div className="flex items-start space-x-4">
              <div className="mt-1 flex-shrink-0">
                <Sparkles className="h-8 w-8 text-gold-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  2017: La Chispa Inicial
                </h3>
                <p className="text-gray-400">
                  Movidos por la pasión y la búsqueda de mejorar la experiencia
                  narguilera en Córdoba, Guille y Matías encendieron la mecha de
                  lo que hoy es Narguilas Córdoba. Un proyecto nacido de la amistad,
                  con la visión de transformar un hobby en una cultura.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="mt-1 flex-shrink-0">
                <Users className="h-8 w-8 text-gold-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Creciendo Juntos
                </h3>
                <p className="text-gray-400">
                  Desde organizar las primeras degustaciones hasta convertirnos
                  en un referente nacional, cada paso ha sido impulsado por
                  nuestra comunidad. Escuchando, aprendiendo y adaptándonos,
                  hemos construido una marca que es sinónimo de calidad y
                  experiencias inolvidables.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};