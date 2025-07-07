"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";

// Array simple de 15 posiciones para las imágenes
const baseEventImages = Array.from({ length: 15 }, (_, index) => ({
  id: index + 1,
  src: `/assets/images/eventos/${index + 1}.jpeg`,
  alt: `Evento ${index + 1}`,
}));

// Función para mezclar array (Fisher-Yates shuffle)
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Función para asignar tamaños aleatorios estilo bento
const assignRandomSizes = <T extends { id: number }>(images: T[]) => {
  const sizeOptions = [
    'h-64',   // pequeño
    'h-80',   // mediano
    'h-96',   // grande
    'h-64',   // pequeño (más frecuente)
    'h-72',   // mediano-pequeño
    'h-88',   // mediano-grande
  ];
  
  return images.map(image => ({
    ...image,
    height: sizeOptions[Math.floor(Math.random() * sizeOptions.length)]
  }));
};

export function EventsGrid() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [visibleImages, setVisibleImages] = useState<number[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  // Memorizar las imágenes mezcladas y con tamaños aleatorios
  const eventImages = useMemo(() => {
    const shuffled = shuffleArray(baseEventImages);
    return assignRandomSizes(shuffled);
  }, []);

  // Función para cargar más imágenes al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      if (gridRef.current) {
        const rect = gridRef.current.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;

        if (isVisible) {
          const currentLength = visibleImages.length;
          // Solo cargar si no has cargado todas las imágenes
          if (currentLength < eventImages.length) {
            const nextBatch = eventImages
              .slice(currentLength, currentLength + 6)
              .map((img) => img.id);

            if (nextBatch.length > 0) {
              setVisibleImages((prev) => [...prev, ...nextBatch]);
            }
          }
        }
      }
    };

    // Cargar las primeras imágenes solo al montar (primera ejecución)
    if (visibleImages.length === 0) {
      setVisibleImages(eventImages.slice(0, 9).map((img) => img.id));
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [eventImages, visibleImages.length]);

  const getSelectedImage = () => {
    if (selectedImage === null) return null;
    return eventImages.find((img) => img.id === selectedImage) || null;
  };

  return (
    <section className="bg-black py-16">
      <div className="container px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl font-bold text-white md:text-4xl">
            Experiencias <span className="text-gold-400">Exclusivas</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Descubre nuestros eventos pasados.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div
          ref={gridRef}
          className="columns-1 gap-4 space-y-4 sm:columns-2 md:columns-3 lg:columns-4"
        >
          {eventImages.map((image) => {
            // Solo renderizar las imágenes que están en el array de visibles
            if (!visibleImages.includes(image.id)) return null;

            return (
              <motion.div
                key={image.id}
                layoutId={`event-${image.id}`}
                className={`group relative cursor-pointer overflow-hidden rounded-lg bg-gray-900 break-inside-avoid ${image.height}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: Math.random() * 0.2 }}
                onClick={() => setSelectedImage(image.id)}
              >
                <div className="relative h-full w-full">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </motion.div>
            );
          })}
        </div>

        {/* Modal para imagen expandida - Solo imagen */}
        <AnimatePresence>
          {selectedImage !== null && getSelectedImage() && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
              onClick={() => setSelectedImage(null)}
            >
              <motion.div
                layoutId={`event-${selectedImage}`}
                className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-6 w-6" />
                  <span className="sr-only">Cerrar</span>
                </button>

                <div className="relative">
                  <Image
                    src={getSelectedImage()?.src || ""}
                    alt={getSelectedImage()?.alt || ""}
                    width={1200}
                    height={800}
                    className="h-auto max-h-[90vh] w-auto max-w-[90vw] object-contain"
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botón para cargar más */}
        {visibleImages.length < eventImages.length && (
          <div className="mt-12 text-center">
            <button
              className="rounded-md border border-gold-500 bg-transparent px-6 py-3 text-gold-400 transition-colors hover:bg-gold-500/10"
              onClick={() => {
                const currentLength = visibleImages.length;
                const nextBatch = eventImages
                  .slice(currentLength, currentLength + 6)
                  .map((img) => img.id);
                setVisibleImages((prev) => [...prev, ...nextBatch]);
              }}
            >
              Cargar Más Eventos
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
