"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const promotions = [
  {
    id: 1,
    title: "Limited Edition Collection",
    description: "Discover our exclusive hand-crafted pieces, available for a limited time only.",
    image: "/images/promotion-1.jpg",
    cta: "Shop Now",
    color: "bg-gradient-to-r from-amber-500 to-amber-700",
  },
  {
    id: 2,
    title: "Premium Tobacco Blends",
    description: "Experience our signature flavors, created by master blenders.",
    image: "/images/promotion-2.jpg",
    cta: "Explore Flavors",
    color: "bg-gradient-to-r from-purple-600 to-indigo-700",
  },
  {
    id: 3,
    title: "VIP Membership",
    description: "Join our exclusive club for early access to new releases and special events.",
    image: "/images/promotion-3.jpg",
    cta: "Join Now",
    color: "bg-gradient-to-r from-gray-800 to-gray-900",
  },
]

export function PromotionCarousel() {
  const [current, setCurrent] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  const next = useCallback(() => {
    setCurrent((current) => (current === promotions.length - 1 ? 0 : current + 1))
  }, [])

  const prev = useCallback(() => {
    setCurrent((current) => (current === 0 ? promotions.length - 1 : current - 1))
  }, [])

  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(next, 5000)
    return () => clearInterval(interval)
  }, [autoplay, next])

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
              {promotions.map((promo) => (
                <div key={promo.id} className="w-full flex-shrink-0 px-4">
                  <Card className={`${promo.color} border-0 overflow-hidden`}>
                    <CardContent className="p-0">
                      <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="p-8 md:p-12 flex flex-col justify-center">
                          <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">{promo.title}</h3>
                          <p className="text-white/80 mb-6">{promo.description}</p>
                          <Button className="w-fit bg-white text-black hover:bg-white/90">{promo.cta}</Button>
                        </div>
                        <div className="h-64 md:h-auto">
                          <div className="h-full w-full bg-gray-800 flex items-center justify-center">
                            <div className="text-white/50 text-sm">Promotion Image</div>
                          </div>
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
            <span className="sr-only">Previous slide</span>
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
            <span className="sr-only">Next slide</span>
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
                <span className="sr-only">Go to slide {index + 1}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
