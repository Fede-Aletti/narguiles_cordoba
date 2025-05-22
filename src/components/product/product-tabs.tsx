"use client"

import { useState } from "react"
import type { IShopProduct } from "@/lib/queries/shop-queries"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductReviews } from "./product-review"


interface ProductTabsProps {
  product: IShopProduct
}

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState("description")

  return (
    <div className="border-t border-gray-800 bg-gray-950">
      <div className="container px-4 py-12 md:px-6">
        <Tabs defaultValue="description" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900">
            <TabsTrigger value="description">Descripción</TabsTrigger>
            <TabsTrigger value="reviews">Reseñas</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6">
            <div className="prose prose-invert max-w-none">
              <h3 className="text-2xl font-serif font-bold text-white">Detalles del Producto</h3>
              <div className="text-gray-400">
                {/* Product description */}
                {product.description ? (
                  <div className="mb-6">
                    <p>{product.description}</p>
                  </div>
                ) : (
                  <p className="mb-6">No hay descripción disponible para este producto.</p>
                )}
                
                {/* Brand description if available */}
                {product.brand?.description && (
                  <div className="mt-8 border-t border-gray-800 pt-6">
                    <h4 className="text-xl font-serif font-bold text-white mb-4">Sobre la marca: {product.brand.name}</h4>
                    <p>{product.brand.description}</p>
                  </div>
                )}

                {/* Category specific content */}
                {product.category?.name?.toLowerCase() === "hookahs" && (
                  <div className="mt-8 border-t border-gray-800 pt-6">
                    <h4 className="text-xl font-serif font-bold text-white mt-6">Experiencia de Fumado</h4>
                    <p className="text-gray-400">
                      Nuestros ingenieros han diseñado meticulosamente los componentes internos para garantizar el equilibrio perfecto del flujo de aire, lo que resulta en una inhalación suave y sin esfuerzo en todo momento. El vástago de precisión y la manguera de calibre ancho brindan una entrega óptima de humo sin restricciones.
                    </p>
                  </div>
                )}
                
                {product.category?.name?.toLowerCase() === "tobacco" && (
                  <div className="mt-8 border-t border-gray-800 pt-6">
                    <h4 className="text-xl font-serif font-bold text-white mt-6">Perfil de Sabor</h4>
                    <p className="text-gray-400">
                      Nuestros maestros mezcladores han seleccionado y combinado cuidadosamente hojas de tabaco premium con sabores naturales para crear una experiencia de sabor única y satisfactoria. La mezcla ofrece un equilibrio perfecto de intensidad de sabor y calidad de humo, con notas que se desarrollan a lo largo de la sesión.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <ProductReviews productId={product.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
