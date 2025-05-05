import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const partners = [
  { id: 1, name: "Smoke & Mirrors", location: "Downtown" },
  { id: 2, name: "Cloud Nine", location: "Westside" },
  { id: 3, name: "Vapor Lounge", location: "Eastside" },
  { id: 4, name: "Hookah Haven", location: "Northside" },
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
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <div className="text-white/50 text-xs">Logo</div>
                </div>
                <h3 className="text-lg font-medium text-white mb-1">{partner.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{partner.location}</p>
                <Button variant="link" className="text-primary hover:text-primary/80 p-0">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
            Become a Partner
          </Button>
        </div>
      </div>
    </section>
  )
}
