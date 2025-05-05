"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Expand, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProductImage {
  id: number
  src: string
  alt: string
}

interface ProductImageCarouselProps {
  images: ProductImage[]
}

export function ProductImageCarousel({ images }: ProductImageCarouselProps) {
  const [currentImage, setCurrentImage] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const nextImage = () => {
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className="relative">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-900">
        <Image
          src={images[currentImage].src || "/placeholder.svg"}
          alt={images[currentImage].alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
          onClick={prevImage}
        >
          <ChevronLeft className="h-6 w-6" />
          <span className="sr-only">Previous image</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
          onClick={nextImage}
        >
          <ChevronRight className="h-6 w-6" />
          <span className="sr-only">Next image</span>
        </Button>

        {/* Action Buttons */}
        <div className="absolute right-4 top-4 flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/50 text-white hover:bg-black/70"
            onClick={toggleFullscreen}
          >
            <Expand className="h-5 w-5" />
            <span className="sr-only">View fullscreen</span>
          </Button>
          <Button variant="ghost" size="icon" className="bg-black/50 text-white hover:bg-black/70">
            <Share2 className="h-5 w-5" />
            <span className="sr-only">Share product</span>
          </Button>
        </div>

        {/* Image Counter */}
        <div className="absolute bottom-4 left-4 rounded bg-black/50 px-2 py-1 text-xs text-white">
          {currentImage + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={image.id}
            className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all ${
              currentImage === index ? "border-gold-500" : "border-transparent hover:border-gold-500/50"
            }`}
            onClick={() => setCurrentImage(index)}
          >
            <Image src={image.src || "/placeholder.svg"} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
          </button>
        ))}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 bg-black/50 text-white hover:bg-black/70"
            onClick={toggleFullscreen}
          >
            <Expand className="h-5 w-5" />
            <span className="sr-only">Exit fullscreen</span>
          </Button>
          <div className="relative h-full max-h-[80vh] w-full max-w-4xl">
            <Image
              src={images[currentImage].src || "/placeholder.svg"}
              alt={images[currentImage].alt}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
            onClick={prevImage}
          >
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Previous image</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
            onClick={nextImage}
          >
            <ChevronRight className="h-6 w-6" />
            <span className="sr-only">Next image</span>
          </Button>
        </div>
      )}
    </div>
  )
}
