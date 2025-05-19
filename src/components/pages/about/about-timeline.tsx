"use client"

import { useRef, useEffect } from "react"
import { motion, useInView, useAnimation } from "framer-motion"

interface TimelineEvent {
  year: string
  title: string
  description: string
}

const timelineEvents: TimelineEvent[] = [
  {
    year: "2024",
    title: "Un Nuevo Capítulo",
    description:
      "Un año que marcará un antes y un después para la cultura narguilera en Argentina. Gracias al apoyo de nuestra comunidad, nos preparamos para un 2024 lleno de sorpresas, innovación y crecimiento. ¡Vamos por más!",
  },
  {
    year: "2023",
    title: "Crecimiento y Evolución",
    description:
      "Crecimos con ustedes. Lanzamos Narguicbaevents, llevando la experiencia narguilera a eventos únicos, con más de 10 casamientos realizados. Sumamos nuevas formas de pago, incorporamos a Ariel al equipo y, lo más importante, dejamos nuestros trabajos para dedicarnos 100% a este sueño.",
  },
  {
    year: "2022",
    title: "Expansión y Liderazgo",
    description:
      "Nos convertimos en sponsor oficial del torneo Campa y únicos en Argentina en vender Darkside. Mudamos nuestro showroom a un espacio más grande y cómodo, reforzando nuestro compromiso con la experiencia del cliente. Además, revolucionamos las redes sociales con contenido cercano que inspiró a toda la comunidad.",
  },
  {
    year: "2021",
    title: "Primer Showroom",
    description:
      "Abrimos nuestro primer showroom y dimos un gran salto desde el garage. Incorporamos productos premium como Fumari, Ziggy y Adalya, posicionándonos como referentes del mercado. Creamos un punto de encuentro para que más personas vivan la experiencia completa de la narguila.",
  },
  {
    year: "2020",
    title: "Reinvención",
    description:
      "El año comenzó con eventos en Zebra Club, pero la pandemia nos obligó a reinventarnos. Implementamos envíos a todo el país, llevando la narguila a cada rincón de Argentina. Nos adaptamos y crecimos incluso en tiempos difíciles.",
  },
  {
    year: "2019",
    title: "Expansión de Productos",
    description:
      "Sumamos productos como Kaloud, carbones de coco y Adalya, ampliando nuestra oferta. Ingresamos al mundo de los boliches, y dimos nuestro primer servicio de catering para un casamiento, llevando la narguila a la vida nocturna.",
  },
  {
    year: "2018",
    title: "Conexión Comunitaria",
    description:
      "Organizamos degustaciones en bares y eventos, fortaleciendo la conexión con nuestra comunidad. El interés por la narguila crecía, y nosotros crecíamos con él. Fue un año clave para posicionar nuestra propuesta y escuchar de cerca a los clientes.",
  },
  {
    year: "2017",
    title: "Los Inicios",
    description:
      "Todo empezó con Guille y Matías, dos amigos buscando mejorar su experiencia narguilera en Córdoba. Lo que comenzó como una pasión, se transformó en un proyecto que sentó las bases de todo lo que vendría. El primer paso de una gran historia.",
  },
].reverse()

export function AboutTimeline() {
  const controls = useAnimation()
  const ref = useRef(null)
  const inView = useInView(ref, { once: false, amount: 0.1 })

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])

  return (
    <section className="bg-gradient-to-b from-black to-gray-900 py-20">
      <div className="container px-4 md:px-6">
        <div className="mb-16 text-center">
          <div className="inline-block rounded-lg bg-gold-500/10 px-3 py-1 text-sm text-gold-400">Nuestra Historia</div>
          <h2 className="mt-4 font-serif text-3xl font-bold text-white md:text-4xl">
            La <span className="text-gold-400">Evolución</span> de Narguilas Córdoba
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
          Un recorrido año por año de nuestro crecimiento, desafíos y logros
          que nos han convertido en quienes somos hoy.
          </p>
        </div>

        <div ref={ref} className="relative mx-auto max-w-4xl">
          {/* Timeline Line */}
          <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-gold-500/80 via-gold-500/50 to-gold-500/10"></div>

          {/* Timeline Events */}
          <div className="space-y-24">
            {timelineEvents.map((event, index) => (
              <motion.div
                key={event.year}
                className={`relative flex ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"} items-center`}
                initial="hidden"
                animate={controls}
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: index * 0.2 } },
                }}
              >
                {/* Timeline Dot */}
                <div className="absolute left-1/2 h-6 w-6 -translate-x-1/2 transform rounded-full border-4 border-gold-500 bg-black"></div>

                {/* Content */}
                <div className={`w-1/2 ${index % 2 === 0 ? "pr-12" : "pl-12 text-left"}`}>
                  <div className="rounded-lg bg-gray-800 p-6 shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-gold-500/20">
                    <span className="inline-block rounded-full bg-gold-500 px-3 py-1 text-sm font-bold text-black">
                      {event.year}
                    </span>
                    <h3 className="mt-3 text-xl font-bold text-white">{event.title}</h3>
                    <p className="mt-2 text-gray-400">{event.description}</p>
                  </div>
                </div>

                {/* Empty space for the other side */}
                <div className="w-1/2"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
