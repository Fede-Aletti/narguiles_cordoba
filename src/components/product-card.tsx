"use client"

import { useState } from "react"
import Link from "next/link"
import { useStore, type Product } from "@/lib/store"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useStore()
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <Card
      className="bg-gray-900 border border-gray-800 overflow-hidden transition-all duration-300 hover:border-gold-500 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-800">
        <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">Product Image</div>

        {/* Quick actions overlay */}
        <div
          className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <Link href={`/tienda/${product.id}`}>
            <Button variant="secondary" size="sm" className="mx-2">
              Quick View
            </Button>
          </Link>
        </div>

        {/* Favorite button */}
        <button
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          onClick={() => setIsFavorite(!isFavorite)}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
          <span className="sr-only">Add to favorites</span>
        </button>

        {/* Category badge */}
        <Badge className="absolute top-3 left-3 bg-gold-500 text-black hover:bg-gold-600">
          {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
        </Badge>
      </div>

      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/shop/${product.id}`} className="hover:text-gold-400 transition-colors">
            <h3 className="font-medium text-white text-lg">{product.name}</h3>
          </Link>
          <span className="text-gold-400 font-semibold">${product.price.toFixed(2)}</span>
        </div>
        <p className="text-gray-400 text-sm line-clamp-2">{product.description}</p>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button className="w-full bg-gold-500 hover:bg-gold-600 text-black" onClick={() => addToCart(product)}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}
