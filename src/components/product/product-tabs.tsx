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
          <TabsList className="grid w-full grid-cols-3 bg-gray-900">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6">
            <div className="prose prose-invert max-w-none">
              <h3 className="text-2xl font-serif font-bold text-white">Product Details</h3>
              <p className="text-gray-400">{product.description || 'No description available.'}</p>
              <p className="text-gray-400">
                Experience the epitome of luxury with our {product.name}. Designed for the discerning hookah enthusiast,
                this piece combines traditional craftsmanship with modern innovation to deliver an unparalleled smoking
                experience.
              </p>
              <h4 className="text-xl font-serif font-bold text-white mt-6">Features</h4>
              <ul className="list-disc pl-5 text-gray-400 space-y-2">
                <li>Premium quality materials ensure durability and longevity</li>
                <li>Expertly crafted by master artisans with attention to every detail</li>
                <li>Elegant design that serves as both a functional piece and a statement decor item</li>
                <li>Smooth draw and excellent smoke production for the perfect session</li>
                <li>Easy to clean and maintain for consistent performance</li>
              </ul>
              {product.category?.name?.toLowerCase() === "hookahs" && (
                <>
                  <h4 className="text-xl font-serif font-bold text-white mt-6">The Perfect Draw</h4>
                  <p className="text-gray-400">
                    Our engineers have meticulously designed the internal components to ensure the perfect balance of
                    airflow, resulting in a smooth and effortless draw every time. The precision-crafted stem and
                    wide-gauge hose provide optimal smoke delivery without restriction.
                  </p>
                </>
              )}
              {product.category?.name?.toLowerCase() === "tobacco" && (
                <>
                  <h4 className="text-xl font-serif font-bold text-white mt-6">Flavor Profile</h4>
                  <p className="text-gray-400">
                    Our master blenders have carefully selected and combined premium tobacco leaves with natural flavors
                    to create a unique and satisfying taste experience. The blend offers a perfect balance of flavor
                    intensity and smoke quality, with notes that develop throughout your session.
                  </p>
                </>
              )}
            </div>
          </TabsContent>
          <TabsContent value="specifications" className="mt-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <tbody>
                  <tr className="border-b border-gray-800">
                    <td className="py-4 pr-4 text-left font-medium text-white">Product Name</td>
                    <td className="py-4 text-gray-400">{product.name}</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-4 pr-4 text-left font-medium text-white">Category</td>
                    <td className="py-4 text-gray-400 capitalize">{product.category?.name || 'N/A'}</td>
                  </tr>
                  {product.category?.name?.toLowerCase() === "hookahs" && (
                    <>
                      <tr className="border-b border-gray-800">
                        <td className="py-4 pr-4 text-left font-medium text-white">Height</td>
                        <td className="py-4 text-gray-400">65 cm</td>
                      </tr>
                      <tr className="border-b border-gray-800">
                        <td className="py-4 pr-4 text-left font-medium text-white">Base Diameter</td>
                        <td className="py-4 text-gray-400">18 cm</td>
                      </tr>
                      <tr className="border-b border-gray-800">
                        <td className="py-4 pr-4 text-left font-medium text-white">Hose Length</td>
                        <td className="py-4 text-gray-400">150 cm</td>
                      </tr>
                      <tr className="border-b border-gray-800">
                        <td className="py-4 pr-4 text-left font-medium text-white">Bowl Type</td>
                        <td className="py-4 text-gray-400">Phunnel</td>
                      </tr>
                    </>
                  )}
                  {product.category?.name?.toLowerCase() === "tobacco" && (
                    <>
                      <tr className="border-b border-gray-800">
                        <td className="py-4 pr-4 text-left font-medium text-white">Weight</td>
                        <td className="py-4 text-gray-400">50g / 250g</td>
                      </tr>
                      <tr className="border-b border-gray-800">
                        <td className="py-4 pr-4 text-left font-medium text-white">Flavor Profile</td>
                        <td className="py-4 text-gray-400">Sweet, Fruity, Mint</td>
                      </tr>
                      <tr className="border-b border-gray-800">
                        <td className="py-4 pr-4 text-left font-medium text-white">Nicotine Content</td>
                        <td className="py-4 text-gray-400">0.05%</td>
                      </tr>
                    </>
                  )}
                  <tr className="border-b border-gray-800">
                    <td className="py-4 pr-4 text-left font-medium text-white">Country of Origin</td>
                    <td className="py-4 text-gray-400">United Arab Emirates</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-4 pr-4 text-left font-medium text-white">Warranty</td>
                    <td className="py-4 text-gray-400">2 Years</td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 text-left font-medium text-white">SKU</td>
                    <td className="py-4 text-gray-400">LH-{product.id.toString().padStart(4, "0")}</td>
                  </tr>
                </tbody>
              </table>
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
