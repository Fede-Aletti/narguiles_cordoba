import { ContactForm } from "@/components/pages/contact/contact-form";
import { ContactInfo } from "@/components/pages/contact/contact-info";
import { ContactMap } from "@/components/pages/contact/contact-map";

export const metadata = {
  title: "Contacto | Narguilas Córdoba",
  description:
    "Ponte en contacto con nosotros para cualquier consulta sobre nuestros productos o servicios.",
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="bg-gradient-to-b from-black to-gray-900 pt-40 pb-12">
          <div className="container px-4 md:px-6">
            <h1 className="text-center font-serif text-4xl font-bold text-white md:text-5xl">
              Ponte en <span className="text-gold-400">Contacto</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-center text-gray-400">
              Estamos aquí para responder a tus preguntas y ayudarte a encontrar
              la experiencia perfecta de shisha.
            </p>
          </div>
        </div>

        <div className="bg-black py-16">
          <div className="container grid gap-12 px-4 md:grid-cols-2 md:px-6">
            <ContactForm />
            <ContactInfo />
          </div>
        </div>

        <ContactMap />
      </main>
    </div>
  );
}
