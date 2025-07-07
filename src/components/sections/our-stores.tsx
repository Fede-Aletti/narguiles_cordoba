import { MapPin, Clock, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const stores = [
  {
    id: 1,
    name: "Narguilas Córdoba",
    address: "Av. Rafael Núñez 4684 Local 3",
    hours: "Lunes a Viernes: 15:00 - 20:00h, Sábados: 17:00 - 21:00h",
    phone: "+54 9 351 423-4567",
    mapUrl: "https://maps.google.com",
    image: "/assets/images/local/local.jpeg",
  },
  {
    id: 2,
    name: "Narguilas Lounge",
    address: "Av. Ambrosio Olmos 796",
    hours:
      "Domingos a Miércoles: 17:00 - 00:00h, Jueves a Sábados: 17:00 - 02:00h",
    phone: "+54 9 351 423-4567",
    mapUrl: "https://maps.google.com",
    image: "/assets/images/local/lounge.jpeg",
  },
];

export function OurStores() {
  return (
    <section className="py-20 bg-gray-950">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-serif font-bold text-center text-white">
          Visitanos en <span className="text-primary">Córdoba</span>
        </h2>
        <p className="text-center text-gray-300 mt-4 mb-12">
          Visitános en nuestro local de compra y venta, o viví la
          experiencia de fumar shisha en nuestro bar.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {stores.map((store) => (
            <Card key={store.id} className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="h-48 bg-gray-800 rounded-md flex items-center justify-center mb-4 overflow-hidden">
                    <Image
                      src={store.image}
                      alt={store.name}
                      width={500}
                      height={500}
                      className="object-cover"
                    />
                  </div>
                </div>

                <h3 className="text-xl font-serif font-bold text-white mb-4">
                  {store.name}
                </h3>

                <div className="space-y-3 text-gray-300">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>{store.address}</span>
                  </div>
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>{store.hours}</span>
                  </div>
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>{store.phone}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary/10"
                  >
                    Ver en Maps
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
