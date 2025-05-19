"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ShopProduct } from "@/lib/queries/shop-queries"
import { ProductStatus } from "@/interfaces/enums"
import { useUserFavoriteProductIds, useToggleFavorite } from "@/lib/queries/favorite-queries"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

interface ProductCardProps {
  product: ShopProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCartFromStore = useStore((state) => state.addToCart)
  const favoriteProductIds = useStore((state) => state.favoriteProductIds)
  const router = useRouter()

  const { data: userFavoritesData, isLoading: isLoadingFavorites } = useUserFavoriteProductIds()
  const { mutate: toggleFavorite, status: toggleFavoriteStatus } = useToggleFavorite()
  const isTogglingFavorite = toggleFavoriteStatus === 'pending'
  const isFavorite = favoriteProductIds.includes(product.id)

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        toast.error("Debes iniciar sesión para añadir a favoritos.")
        router.push(`/login?returnTo=/tienda/${product.slug}`)
      } else {
        toggleFavorite({ productId: product.id, isCurrentlyFavorite: isFavorite })
      }
    })
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error("Debes iniciar sesión para añadir al carrito.")
      router.push(`/login?returnTo=/tienda/${product.slug}`)
    } else {
      addToCartFromStore(product)
      toast.success(`${product.name} añadido al carrito!`)
    }
  }

  const mainImage = product.media && product.media.length > 0 
    ? product.media[0].url 
    : "/placeholder.svg"

  const statusDisplay = {
    'in_stock': 'En Stock',
    'out_of_stock': 'Agotado',
    'running_low': 'Poco Stock'
  }[product.status as ProductStatus]

  const statusColor = {
    'in_stock': 'bg-green-500',
    'out_of_stock': 'bg-red-500',
    'running_low': 'bg-yellow-500'
  }[product.status as ProductStatus]

  const [isCardHovered, setIsCardHovered] = useState(false)

  return (
    <Card
      className="bg-gray-900 border border-gray-800 overflow-hidden transition-all duration-300 hover:border-gold-500 group relative"
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
    >
      <button
        className={`absolute top-3 right-3 z-20 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors ${isTogglingFavorite ? 'animate-pulse' : ''}`}
        onClick={handleToggleFavorite}
        disabled={isTogglingFavorite || isLoadingFavorites}
        aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
      >
        <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
        <span className="sr-only">{isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}</span>
      </button>

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
        <div
          className={`absolute inset-0 bg-black/70 flex items-center justify-center transition-opacity duration-300 z-10 ${isCardHovered ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <Link href={`/tienda/${product.slug}`} passHref legacyBehavior>
            <a className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 mx-2">
              Ver Detalle
            </a>
          </Link>
        </div>
        {product.category && (
          <Badge className="absolute top-3 left-3 z-20 bg-gold-500 text-black hover:bg-gold-600">
            {product.category.name}
          </Badge>
        )}
        <Badge className={`absolute bottom-3 left-3 z-20 ${statusColor} text-black`}>
          {statusDisplay}
        </Badge>
      </div>

      <CardContent className="p-4 md:p-6">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/tienda/${product.slug}`} className="hover:text-gold-400 transition-colors">
            <h3 className="font-medium text-white text-lg truncate" title={product.name}>{product.name}</h3>
          </Link>
          <span className="text-gold-400 font-semibold ml-2 flex-shrink-0">${product.price?.toFixed(2) || "N/A"}</span>
        </div>
        {product.brand && (
          <div className="text-gray-400 text-sm mb-2 truncate" title={product.brand.name}> 
            Marca: {product.brand.name}
          </div>
        )}
        <p className="text-gray-400 text-sm line-clamp-2 h-10">{product.description || "Sin descripción"}</p>
      </CardContent>

      <CardFooter className="p-4 md:p-6 pt-0">
        <Button 
          className="w-full bg-gold-500 hover:bg-gold-600 text-black"
          onClick={handleAddToCart}
          disabled={product.status === "out_of_stock"}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.status === "out_of_stock" ? "Agotado" : "Añadir al Carrito"}
        </Button>
      </CardFooter>
    </Card>
  )
}
