"use client";

import { motion } from "framer-motion";
import Image from "next/image";

// Array de 15 imágenes de lugares
const placesImages = Array.from({ length: 15 }, (_, index) => ({
  id: index + 1,
  src: `/assets/images/places/${index + 1}.jpeg`,
  alt: `Lugar ${index + 1}`,
}));

export function EventsMarquee() {
  return (
    <section className="bg-black py-16 overflow-hidden">
      <div className="container px-4 md:px-6 mb-8">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold text-white md:text-4xl">
            Nuestros <span className="text-gold-400">Espacios</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Descubre los lugares donde creamos experiencias únicas.
          </p>
        </div>
      </div>

      {/* Marquee Container */}
      <div className="relative">
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-black to-transparent" />
        <div className="absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-black to-transparent" />
        
        {/* Marquee Content */}
        <div className="flex">
          {/* Primera instancia del marquee */}
          <motion.div
            className="flex shrink-0 gap-6"
            animate={{
              x: [0, -100 * placesImages.length],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 40,
                ease: "linear",
              },
            }}
          >
            {placesImages.map((image) => (
              <div
                key={`first-${image.id}`}
                className="relative h-64 w-80 shrink-0 overflow-hidden rounded-lg bg-gray-900"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-110"
                  sizes="320px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            ))}
          </motion.div>

          {/* Segunda instancia del marquee para continuidad */}
          <motion.div
            className="flex shrink-0 gap-6"
            animate={{
              x: [0, -100 * placesImages.length],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 40,
                ease: "linear",
              },
            }}
          >
            {placesImages.map((image) => (
              <div
                key={`second-${image.id}`}
                className="relative h-64 w-80 shrink-0 overflow-hidden rounded-lg bg-gray-900"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-110"
                  sizes="320px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
} 