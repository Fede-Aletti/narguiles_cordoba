import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"
import Link from "next/link"

const partners = [
  { id: 1, name: "Seis Monos", description: "Disfruta de un ambiente relajado y buena música mientras fumas una narguila de calidad premium.", location: "Obispo Oro 274" },
  { id: 2, name: "Chill", description: "Ven y relájate en Chill, ubicado en la hermosa Costanera de Carlos Paz, donde el confort y la buena onda están asegurados.", location: "Av. Arturo Umberto Illia 1093" },
  { id: 3, name: "Qara", description: "Sumérgete en una experiencia única en Qara, ubicado en el centro de Córdoba, y disfruta de deliciosa comida árabe junto con tu narguila.", location: "Paraná 206" },
  { id: 4, name: "Tres Fuegos", description: "Vive una experiencia única en Tres Fuegos, donde puedes disfrutar de picadas, vinos y sorrentinos, el lugar ideal para compartir con amigos y disfrutar de una excelente narguila.", location: "Chacabuco 811" },
]

export function PartnerRetailers() {
  return (
    <section className="py-20 bg-black">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-serif font-bold text-center mb-4 text-white">
          Encontranos <span className="text-primary">en</span>
        </h2>
        <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
          Encuentra nuestros productos premium en estas tiendas confiables en la ciudad.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {partners.map((partner) => (
            <Card key={partner.id} className="bg-gray-900 border-gray-800">
              <CardContent className="p-6 text-center flex flex-col justify-between h-full">
                <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <div className="text-white/50 text-xs">Logo</div>
                </div>
                <h3 className="text-lg font-medium text-white mb-1">{partner.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{partner.description}</p>
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

        <div className="mt-12 text-center">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
            Ser un distribuidor
          </Button>
        </div>
      </div>
    </section>
  )
}
