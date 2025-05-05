import { Button } from "@/components/ui/button";
import { MapPin, Mail, Phone } from "lucide-react";

export function AboutContact() {
  return (
    <section className="bg-gradient-to-b from-gray-900 to-black py-20">
      <div className="container px-4 md:px-6">
        <div className="grid gap-12 md:grid-cols-2">
          <div className="space-y-6">
            <div className="inline-block rounded-lg bg-gold-500/10 px-3 py-1 text-sm text-gold-400">
              Get in Touch
            </div>
            <h2 className="font-serif text-3xl font-bold text-white md:text-4xl">
              Visit Our <span className="text-gold-400">Showrooms</span>
            </h2>
            <p className="text-gray-400">
              Experience our products firsthand at our luxury showrooms. Our
              knowledgeable staff will guide you through our collections and
              help you find the perfect hookah for your needs.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-start space-x-4">
                <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-gold-400" />
                <div>
                  <h3 className="text-lg font-medium text-white">
                    Downtown Showroom
                  </h3>
                  <p className="text-gray-400">123 Main Street, Downtown</p>
                  <p className="text-gray-400">
                    Mon-Sat: 12pm-10pm, Sun: 2pm-8pm
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-gold-400" />
                <div>
                  <h3 className="text-lg font-medium text-white">
                    Uptown Showroom
                  </h3>
                  <p className="text-gray-400">456 Park Avenue, Uptown</p>
                  <p className="text-gray-400">
                    Mon-Sat: 2pm-12am, Sun: 2pm-10pm
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-2">
                <Phone className="h-5 w-5 flex-shrink-0 text-gold-400" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </div>

              <div className="flex items-center space-x-4">
                <Mail className="h-5 w-5 flex-shrink-0 text-gold-400" />
                <span className="text-gray-300">info@luxuryhookah.com</span>
              </div>
            </div>

            <Button className="mt-4 bg-gold-500 text-black hover:bg-gold-600">
              Book a Consultation
            </Button>
          </div>

          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-800">
            <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">
              Store Map
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
