"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/lib/store";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

// Helper function to shuffle an array
const shuffleArray = <T extends any[]>(array: T): T => {
  const newArray = [...array] as T;
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export function FeaturedProducts() {
  const allProducts = useStore((state) => state.products);
  const addToCartFromStore = useStore((state) => state.addToCart);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [randomizedProducts, setRandomizedProducts] = useState<Product[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (allProducts && allProducts.length > 0) {
      const shuffled = shuffleArray([...allProducts]);
      setRandomizedProducts(shuffled.slice(0, 3));
    } else {
      setRandomizedProducts([]);
    }
  }, [allProducts]);

  const handleAddToCartClick = async (product: Product) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Debes iniciar sesión para añadir al carrito.");
      router.push(`/login?returnTo=${pathname}`);
    } else {
      addToCartFromStore(product);
      toast.success(`${product.name} añadido al carrito!`);
    }
  };

  if (allProducts.length === 0 && randomizedProducts.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-white">
              Productos <span className="text-primary">destacados</span>
            </h2>
            <Link href="/tienda" className="text-primary hover:text-primary/80">
              Ver todos los productos
            </Link>
          </div>
          <div className="text-center py-10 text-gray-400">
            No hay productos destacados disponibles en este momento.
          </div>
        </div>
      </section>
    );
  } else if (randomizedProducts.length === 0 && allProducts.length > 0) {
    return (
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-white">
              Productos <span className="text-primary">destacados</span>
            </h2>
            <Link href="/tienda" className="text-primary hover:text-primary/80">
              Ver todos los productos
            </Link>
          </div>
          <div className="text-center py-10 text-gray-400">
            Cargando productos destacados...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-white">
            Productos <span className="text-primary">destacados</span>
          </h2>
          <Link href="/tienda" className="text-primary hover:text-primary/80">
            Ver todos los productos
          </Link>
        </div>

        {randomizedProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {randomizedProducts.map((product) => (
              <Card
                key={product.id}
                className="bg-gray-900 border border-gray-800 overflow-hidden transition-all duration-300 hover:border-primary"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <div className="relative aspect-square overflow-hidden bg-gray-800">
                  {product.image ? (
                     <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">
                      Product Image
                    </div>
                  )}
                  {hoveredProduct === product.id && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <Link href={`/tienda/${product.id}`} passHref>
                        <Button variant="secondary" size="sm" asChild>
                          <a>Quick View</a>
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-white text-lg">
                      {product.name}
                    </h3>
                    <span className="text-primary font-semibold">
                      ${product.price?.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {product.description}
                  </p>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button
                    className="w-full bg-primary hover:bg-primary/80 text-primary-foreground"
                    onClick={() => handleAddToCartClick(product)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
