"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

// Predefined background gradients with good contrast for white text
const gradients = [
  "bg-gradient-to-r from-amber-600 to-amber-900",
  "bg-gradient-to-r from-purple-700 to-indigo-900",
  "bg-gradient-to-r from-emerald-600 to-teal-900",
  "bg-gradient-to-r from-rose-600 to-pink-900",
  "bg-gradient-to-r from-blue-600 to-indigo-900",
  "bg-gradient-to-r from-gray-800 to-gray-950",
]

interface Promotion {
  id: string
  title: string
  description: string
  image?: {
    url: string
    alt_text?: string
  }
  created_at: string
}

export function PromotionCarousel() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  // Fetch promotions from Supabase
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true)
        const supabase = createClient()
        
        const { data, error } = await supabase
          .from("promotions")
          .select(`
            *,
            image:image_id (
              url,
              alt_text
            )
          `)
          .eq("active", true)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
        
        if (error) {
          console.error("Error fetching promotions:", error)
          return
        }
        
        if (data && data.length > 0) {
          setPromotions(data)
        } else {
          // Use fallback promotions if none in the database
          setPromotions([
            {
              id: "1",
              title: "Colección de Edición Limitada",
              description: "Descubre nuestras exclusivas piezas hechas a mano, disponibles por tiempo limitado.",
              created_at: new Date().toISOString()
            },
            {
              id: "2",
              title: "Mezclas Premium de Tabaco",
              description: "Experimenta nuestros sabores exclusivos, creados por maestros mezcladores.",
              created_at: new Date().toISOString()
            },
            {
              id: "3",
              title: "Membresía VIP",
              description: "Únete a nuestro club exclusivo para acceso anticipado a nuevos lanzamientos y eventos especiales.",
              created_at: new Date().toISOString()
            }
          ])
        }
      } catch (err) {
        console.error("Error in fetchPromotions:", err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPromotions()
  }, [])

  const next = useCallback(() => {
    if (promotions.length === 0) return
    setCurrent((current) => (current === promotions.length - 1 ? 0 : current + 1))
  }, [promotions.length])

  const prev = useCallback(() => {
    if (promotions.length === 0) return
    setCurrent((current) => (current === 0 ? promotions.length - 1 : current - 1))
  }, [promotions.length])

  useEffect(() => {
    if (!autoplay || promotions.length === 0) return

    const interval = setInterval(next, 5000)
    return () => clearInterval(interval)
  }, [autoplay, next, promotions.length])

  if (loading) {
    return <PromotionCarouselSkeleton />
  }

  if (promotions.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-black">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-serif font-bold text-center mb-12 text-white">
          Ofertas <span className="text-primary">exclusivas</span>
        </h2>

        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {promotions.map((promo, index) => (
                <div key={promo.id} className="w-full flex-shrink-0 px-4">
                  <Card className={`${gradients[index % gradients.length]} border-0 overflow-hidden`}>
                    <CardContent className="p-0">
                      <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="p-8 md:p-12 flex flex-col justify-center">
                          <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">{promo.title}</h3>
                          <p className="text-white/80 mb-6">{promo.description}</p>
                          <Link href="/tienda">
                            <Button className="w-fit bg-white text-black hover:bg-white/90">
                              Ir a la tienda!
                            </Button>
                          </Link>
                        </div>
                        <div className="h-64 md:h-auto">
                          {promo.image ? (
                            <img 
                              src={promo.image.url} 
                              alt={promo.image.alt_text || promo.title} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gray-800 flex items-center justify-center">
                              <div className="text-white/50 text-sm">Imagen Promocional</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 z-10"
            onClick={prev}
            onMouseEnter={() => setAutoplay(false)}
            onMouseLeave={() => setAutoplay(true)}
          >
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Anterior</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 z-10"
            onClick={next}
            onMouseEnter={() => setAutoplay(false)}
            onMouseLeave={() => setAutoplay(true)}
          >
            <ChevronRight className="h-6 w-6" />
            <span className="sr-only">Siguiente</span>
          </Button>

          <div className="flex justify-center mt-4 gap-2">
            {promotions.map((_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full ${current === index ? "bg-primary" : "bg-gray-600"}`}
                onClick={() => setCurrent(index)}
                onMouseEnter={() => setAutoplay(false)}
                onMouseLeave={() => setAutoplay(true)}
              >
                <span className="sr-only">Ir a la diapositiva {index + 1}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function PromotionCarouselSkeleton() {
  return (
    <section className="py-20 bg-black">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-serif font-bold text-center mb-12 text-white">
          Ofertas <span className="text-primary">exclusivas</span>
        </h2>

        <div className="relative">
          <Skeleton className="w-full h-[300px] md:h-[400px] bg-gray-800 rounded-lg" />
        </div>
      </div>
    </section>
  )
}
