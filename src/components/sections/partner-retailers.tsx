"use client"
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

import Image from "next/image";
import { LOGO_URL } from "@/lib/constants";

const partners = [
  {
    id: 3,
    name: "Qara",
    description:
      "Sumérgete en una experiencia única en Qara, ubicado en el centro de Córdoba, y disfruta de deliciosa comida árabe junto con tu narguila.",
    location: "Paraná 206",
  },
  {
    id: 4,
    name: "Tres Fuegos",
    description:
      "Vive una experiencia única en Tres Fuegos, donde puedes disfrutar de picadas, vinos y sorrentinos, el lugar ideal para compartir con amigos y disfrutar de una excelente narguila.",
    location: "Chacabuco 811",
  },
];

export function PartnerRetailers() {
  return (
    <section className="py-20 bg-black">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-serif font-bold text-center mb-4 text-white">
          Encontranos <span className="text-primary">en</span>
        </h2>
        <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
          Encuentra nuestros productos premium en estas tiendas confiables en la
          ciudad.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {partners.map((partner) => (
            <Card key={partner.id} className="bg-gray-900 border-gray-800">
              <CardContent className="p-6 text-center flex flex-col justify-between h-full">
                <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <div className="text-white/50 text-xs">Logo</div>
                </div>
                <h3 className="text-lg font-medium text-white mb-1">
                  {partner.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {partner.description}
                </p>
                <div className="flex items-center justify-center gap-2 pb-4 border-b border-gray-800">
                  <MapPin className="w-4 h-4 text-primary" />
                  <p className="text-gray-400 text-sm">{partner.location}</p>
                </div>

                {/* <Link href={`/tienda/${partner.id}`} className="text-primary hover:text-primary/80 p-0">
                  Ver detalles
                </Link> */}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12">
          <Card className="bg-gradient-to-br from-purple-900/20 via-gray-900 to-gray-800 border-gray-700 border-2 w-full mx-auto overflow-hidden group hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500">
            <CardContent className="p-0">
              {/* Header con gradiente */}
              <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/80 to-violet-600/80 animate-pulse"></div>
                <div className="relative z-10">
                  <div className="size-20 bg-white/20 backdrop-blur-sm rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-white/30 group-hover:scale-110 transition-transform duration-300">
                    <Image 
                      src={LOGO_URL} 
                      alt="Logo" 
                      width={64} 
                      height={64}
                      className="rounded-full"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 font-serif">
                    ¿Tenés un negocio?
                  </h3>
                  <p className="text-purple-100 font-medium">
                    Comenzá con este sueño
                  </p>
                </div>
              </div>

              {/* Contenido principal */}
              <div className="p-8 text-center space-y-6">
                <div className="space-y-4">
                  <h4 className="text-xl font-semibold text-white">
                    Sumate a la comunidad
                  </h4>
                  <p className="text-gray-300 leading-relaxed">
                    Comercializá nuestros productos premium y convertite en parte de una comunidad en crecimiento.
                  </p>
                  
                </div>

                <Button 
                  className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-100 w-full group"
                  onClick={() => {
                    window.open("https://wa.me/5493513705773?text=Hola, quiero ser distribuidor", "_blank");
                  }}
                >
                  <span className="mr-2">✨</span>
                  Ser un distribuidor
                  <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
