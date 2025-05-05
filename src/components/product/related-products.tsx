"use client"

import { useStore } from "@/lib/store"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef } from "react"

interface RelatedProductsProps {
  currentProductId: number
  category: string
}

export function RelatedProducts({ currentProductId, category }: RelatedProductsProps) {
  const { products } = useStore()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Filter products by category and exclude current product
  const relatedProducts = products
    .filter((product) => product.category === category && product.id !== currentProductId)
    .slice(0, 6)

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef
      const scrollAmount = direction === "left" ? -current.offsetWidth / 2 : current.offsetWidth / 2
      current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  if (relatedProducts.length === 0) {
    return null
  }

  return (
    <section className="border-t border-gray-800 bg-black py-16">
      <div className="container px-4 md:px-6">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold text-white md:text-3xl">
            Related <span className="text-gold-400">Products</span>
          </h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="border-gray-700 text-white hover:bg-gray-800"
              onClick={() => scroll("left")}
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Scroll left</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="border-gray-700 text-white hover:bg-gray-800"
              onClick={() => scroll("right")}
            >
              <ChevronRight className="h-5 w-5" />
              <span className="sr-only">Scroll right</span>
            </Button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex space-x-6 overflow-x-auto pb-6 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {relatedProducts.map((product) => (
            <div key={product.id} className="w-[280px] flex-shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
