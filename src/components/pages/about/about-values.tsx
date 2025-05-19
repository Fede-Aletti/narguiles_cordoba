import {
  HeartHandshake,
  Lightbulb,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";

interface ValueCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const ValueCard = ({ icon: Icon, title, description }: ValueCardProps) => (
  <div className="flex flex-col items-center rounded-lg bg-gray-800 p-6 text-center shadow-lg transition-transform hover:scale-105">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold-500 text-black">
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="mb-2 text-xl font-semibold text-white">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

export const NuestrosValores = () => {
  const values = [
    {
      icon: Star,
      title: "Pasión por la Excelencia",
      description:
        "Cada producto y servicio es un reflejo de nuestra dedicación por ofrecer lo mejor, superando expectativas.",
    },
    {
      icon: ShieldCheck,
      title: "Calidad Inigualable",
      description:
        "Seleccionamos solo productos premium y mantenemos los más altos estándares en todo lo que hacemos.",
    },
    {
      icon: Lightbulb,
      title: "Innovación Constante",
      description:
        "Buscamos continuamente nuevas formas de sorprender y mejorar la experiencia narguilera en Argentina.",
    },
    {
      icon: Users,
      title: "Comunidad Unida",
      description:
        "Fomentamos un espacio de encuentro y conexión, valorando el apoyo y la participación de cada miembro.",
    },
    {
      icon: HeartHandshake,
      title: "Compromiso con el Cliente",
      description:
        "Tu satisfacción es nuestra prioridad. Nos esforzamos por brindar una atención personalizada y memorable.",
    },
  ];

  return (
    <section className="bg-gray-900 py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl font-bold text-white md:text-4xl">
            Nuestros <span className="text-gold-400">Valores Fundamentales</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Los pilares que guían cada una de nuestras decisiones y acciones,
            asegurando una experiencia Narguilas Córdoba auténtica.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value) => (
            <ValueCard
              key={value.title}
              icon={value.icon}
              title={value.title}
              description={value.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};