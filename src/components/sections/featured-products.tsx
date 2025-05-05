"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

export function FeaturedProducts() {
  const { products, addToCart } = useStore();
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  return (
    <section className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-white">
            Productos <span className="text-primary">destacados</span>
          </h2>
          <Button variant="link" className="text-primary hover:text-primary/80">
            Ver todos los productos
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.slice(0, 3).map((product) => (
            <Card
              key={product.id}
              className="bg-gray-900 border border-gray-800 overflow-hidden transition-all duration-300 hover:border-primary"
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <div className="relative aspect-square overflow-hidden bg-gray-800">
                <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">
                  Product Image
                </div>
                {hoveredProduct === product.id && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <Button variant="secondary" size="sm">
                      Quick View
                    </Button>
                  </div>
                )}
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-white text-lg">
                    {product.name}
                  </h3>
                  <span className="text-primary font-semibold">
                    ${product.price}
                  </span>
                </div>
                <p className="text-gray-400 text-sm line-clamp-2">
                  {product.description}
                </p>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button
                  className="w-full bg-primary hover:bg-primary/80 text-primary-foreground"
                  onClick={() => addToCart(product)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
