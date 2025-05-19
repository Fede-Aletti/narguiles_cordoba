"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ShopProduct } from "@/lib/queries/shop-queries"
import { ProductStatus } from "@/interfaces/enums"

interface ProductCardProps {
  product: ShopProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useStore()
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  // Get the main image or use a placeholder
  const mainImage = product.media && product.media.length > 0 
    ? product.media[0].url 
    : "/placeholder.svg"

  // Format the product status for display
  const statusDisplay = {
    'in_stock': 'En Stock',
    'out_of_stock': 'Agotado',
    'running_low': 'Poco Stock'
  }[product.status as ProductStatus]

  // Status badge color
  const statusColor = {
    'in_stock': 'bg-green-500',
    'out_of_stock': 'bg-red-500',
    'running_low': 'bg-yellow-500'
  }[product.status as ProductStatus]

  return (
    <Card
      className="bg-gray-900 border border-gray-800 overflow-hidden transition-all duration-300 hover:border-gold-500 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-800">
        {mainImage ? (
          <Image 
            src={mainImage} 
            alt={product.media?.[0]?.alt || product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105" 
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">No Image</div>
        )}

        {/* Quick actions overlay */}
        <div
          className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <Link href={`/tienda/${product.slug}`}>
            <Button variant="secondary" size="sm" className="mx-2">
              Ver Detalle
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
        {product.category && (
        <Badge className="absolute top-3 left-3 bg-gold-500 text-black hover:bg-gold-600">
            {product.category.name}
          </Badge>
        )}
        
        {/* Status badge */}
        <Badge className={`absolute bottom-3 left-3 ${statusColor} text-black`}>
          {statusDisplay}
        </Badge>
      </div>

      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/tienda/${product.slug}`} className="hover:text-gold-400 transition-colors">
            <h3 className="font-medium text-white text-lg">{product.name}</h3>
          </Link>
          <span className="text-gold-400 font-semibold">${product.price?.toFixed(2) || "N/A"}</span>
        </div>
        {product.brand && (
          <div className="text-gray-400 text-sm mb-2">
            Marca: {product.brand.name}
          </div>
        )}
        <p className="text-gray-400 text-sm line-clamp-2">{product.description || "Sin descripción"}</p>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button 
          className="w-full bg-gold-500 hover:bg-gold-600 text-black"
          onClick={() => addToCart(product)}
          disabled={product.status === "out_of_stock"}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.status === "out_of_stock" ? "Agotado" : "Añadir al Carrito"}
        </Button>
      </CardFooter>
    </Card>
  )
}
