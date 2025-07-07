
import { FlameIcon } from "lucide-react";
import Image from "next/image";

export const NosotrosHero = () => {
  return (
    <section className="relative bg-gray-950 py-20 md:py-32">
      <div className="absolute inset-0 z-0 opacity-30">
        {/* Optional: Subtle background pattern or image */}
        <Image src="/assets/images/eventos/1.jpeg" alt="Background" layout="fill" objectFit="cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
      </div>
      <div className="container relative z-10 mx-auto px-4 text-center">
        <div className="mb-6 flex justify-center">
          <FlameIcon className="h-16 w-16 text-gold-400" />
        </div>
        <h1 className="font-serif text-4xl font-bold text-white sm:text-5xl md:text-6xl">
          Nuestra <span className="text-gold-400">Pasión</span>, Tu{" "}
          <span className="text-gold-400">Experiencia</span>
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-gray-300 text-lg">
          Desde 2017, Narguilas Córdoba ha sido más que un negocio; es la
          materialización de un sueño compartido. Descubre la historia de cómo
          dos amigos transformaron su pasión por la narguila en la marca
          referente de Argentina, dedicada a elevar cada momento.
        </p>
      </div>
    </section>
  );
};
  