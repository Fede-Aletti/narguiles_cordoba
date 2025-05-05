"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";

// Datos de ejemplo para los eventos
const eventImages = [
  {
    id: 1,
    src: "/placeholder.svg?height=600&width=400&text=Evento+VIP",
    alt: "Evento VIP",
    title: "Noche VIP de Degustación",
    description:
      "Una velada exclusiva con nuestras mezclas premium de tabaco y cócteles artesanales.",
    date: "15 de Octubre, 2023",
    size: "large", // large, medium, small para el tamaño en el grid
  },
  {
    id: 2,
    src: "/placeholder.svg?height=400&width=600&text=Lanzamiento+Colección",
    alt: "Lanzamiento de Colección",
    title: "Lanzamiento Colección Royal Gold",
    description:
      "Presentación de nuestra nueva línea de hookahs con acabados en oro de 24k.",
    date: "28 de Septiembre, 2023",
    size: "medium",
  },
  {
    id: 3,
    src: "/placeholder.svg?height=500&width=500&text=Masterclass",
    alt: "Masterclass de Shisha",
    title: "Masterclass de Preparación",
    description:
      "Aprende los secretos de nuestros expertos para preparar la shisha perfecta.",
    date: "5 de Noviembre, 2023",
    size: "medium",
  },
  {
    id: 4,
    src: "/placeholder.svg?height=600&width=400&text=Fiesta+Privada",
    alt: "Fiesta Privada",
    title: "Fiesta Privada en Terraza",
    description:
      "Celebración exclusiva con vistas panorámicas y nuestra selección premium.",
    date: "12 de Agosto, 2023",
    size: "small",
  },
  {
    id: 5,
    src: "/placeholder.svg?height=400&width=600&text=Cata+Sabores",
    alt: "Cata de Sabores",
    title: "Cata de Sabores Exóticos",
    description: "Degustación de nuestras mezclas más exóticas y exclusivas.",
    date: "3 de Diciembre, 2023",
    size: "large",
  },
  {
    id: 6,
    src: "/placeholder.svg?height=500&width=500&text=Evento+Corporativo",
    alt: "Evento Corporativo",
    title: "Evento Corporativo Premium",
    description:
      "Experiencia personalizada para empresas en nuestro salón privado.",
    date: "20 de Julio, 2023",
    size: "medium",
  },
  {
    id: 7,
    src: "/placeholder.svg?height=600&width=400&text=Noche+Temática",
    alt: "Noche Temática",
    title: "Noche Árabe",
    description:
      "Inmersión completa en la cultura árabe con música, gastronomía y shishas premium.",
    date: "8 de Octubre, 2023",
    size: "small",
  },
  {
    id: 8,
    src: "/placeholder.svg?height=400&width=600&text=Festival",
    alt: "Festival de Hookah",
    title: "Festival Internacional de Hookah",
    description:
      "Participación en el evento más importante del mundo de la shisha.",
    date: "15-17 de Noviembre, 2023",
    size: "medium",
  },
  {
    id: 9,
    src: "/placeholder.svg?height=500&width=500&text=Aniversario",
    alt: "Aniversario",
    title: "Celebración de Aniversario",
    description:
      "Festejo por nuestro 5º aniversario con invitados especiales y sorpresas exclusivas.",
    date: "25 de Septiembre, 2023",
    size: "large",
  },
  {
    id: 10,
    src: "/placeholder.svg?height=600&width=400&text=Colaboración",
    alt: "Colaboración Especial",
    title: "Colaboración con Diseñador",
    description:
      "Presentación de nuestra edición limitada diseñada por un reconocido artista.",
    date: "10 de Enero, 2024",
    size: "medium",
  },
  {
    id: 11,
    src: "/placeholder.svg?height=400&width=600&text=Taller",
    alt: "Taller de Mezclas",
    title: "Taller de Creación de Mezclas",
    description:
      "Crea tu propia mezcla de tabaco guiado por nuestros expertos blenders.",
    date: "7 de Diciembre, 2023",
    size: "small",
  },
  {
    id: 12,
    src: "/placeholder.svg?height=500&width=500&text=Inauguración",
    alt: "Inauguración",
    title: "Inauguración Nueva Tienda",
    description:
      "Apertura de nuestro nuevo flagship store con cóctel de bienvenida.",
    date: "30 de Noviembre, 2023",
    size: "medium",
  },
];

export function EventsGrid() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [visibleImages, setVisibleImages] = useState<number[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  // Función para cargar más imágenes al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      if (gridRef.current) {
        const rect = gridRef.current.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;

        if (isVisible) {
          const currentLength = visibleImages.length;
          const nextBatch = eventImages
            .slice(currentLength, currentLength + 4)
            .map((img) => img.id);

          if (nextBatch.length > 0) {
            setVisibleImages((prev) => [...prev, ...nextBatch]);
          }
        }
      }
    };

    // Cargar las primeras imágenes al montar
    setVisibleImages(eventImages.slice(0, 8).map((img) => img.id));

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visibleImages]);

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
            Descubre nuestros eventos pasados y próximos. Cada ocasión es una
            oportunidad para sumergirse en el mundo del lujo y la excelencia.
          </p>
        </div>

        {/* Bento Grid / Masonry */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          {eventImages.map((image) => {
            // Solo renderizar las imágenes que están en el array de visibles
            if (!visibleImages.includes(image.id)) return null;

            // Determinar el tamaño del elemento en el grid
            let sizeClasses = "";
            if (image.size === "large") {
              sizeClasses = "sm:col-span-2 sm:row-span-2";
            } else if (image.size === "medium") {
              sizeClasses = "sm:col-span-1 sm:row-span-2";
            }

            return (
              <motion.div
                key={image.id}
                layoutId={`event-${image.id}`}
                className={`group relative cursor-pointer overflow-hidden rounded-lg bg-gray-900 ${sizeClasses}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                onClick={() => setSelectedImage(image.id)}
              >
                <div className="aspect-square w-full">
                  <Image
                    src={image.src || "/placeholder.svg"}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-lg font-bold text-white">
                      {image.title}
                    </h3>
                    <p className="text-sm text-gold-400">{image.date}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Modal para imagen expandida */}
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
                className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-lg bg-gray-900"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-6 w-6" />
                  <span className="sr-only">Cerrar</span>
                </button>

                <div className="relative aspect-video w-full max-w-4xl">
                  <Image
                    src={getSelectedImage()?.src || ""}
                    alt={getSelectedImage()?.alt || ""}
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                </div>

                <div className="bg-gray-900 p-6">
                  <h3 className="mb-2 text-2xl font-bold text-white">
                    {getSelectedImage()?.title}
                  </h3>
                  <p className="mb-4 text-sm text-gold-400">
                    {getSelectedImage()?.date}
                  </p>
                  <p className="text-gray-400">
                    {getSelectedImage()?.description}
                  </p>
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
                  .slice(currentLength, currentLength + 4)
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
