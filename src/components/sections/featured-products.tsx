"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/lib/store";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

// Interface to match the structure returned by the RPC function
interface RPCProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  image_url?: string;
  category_name?: string;
  total_sold: number;
}

// This will be the type after mapping, conforming to Product for wider use
interface MappedProduct extends Product {
  totalSales: number;
}

export function FeaturedProducts() {
  const allProductsFromStore = useStore((state) => state.products); // Renamed for clarity
  const addToCartFromStore = useStore((state) => state.addToCart);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const {
    data: topSellingProducts,
    isLoading,
    error,
  } = useQuery<MappedProduct[], Error>({
    queryKey: ["topSellingProductsRPC"],
    queryFn: async (): Promise<MappedProduct[]> => {
      const supabase = createClient();
      const { data, error: rpcError } = await supabase.rpc(
        "get_top_3_bestselling_products"
      );

      if (rpcError) {
        console.error(
          "Error calling RPC get_top_3_bestselling_products:",
          rpcError
        );
        throw rpcError;
      }

      const rpcData = (data as RPCProduct[]) || [];

      return rpcData.map(
        (p: RPCProduct): MappedProduct => ({
          id: String(p.id),
          name: p.name || "Producto Desconocido",
          slug: p.slug || String(p.id),
          description: p.description || "",
          price: p.price || 0,
          image: p.image_url || "/placeholder.svg",
          category: p.category_name || "Sin categoría",
          stock: p.stock || 0,
          maxStock: p.stock || 99, // Add maxStock for Product type compatibility
          totalSales: p.total_sold || 0,
        })
      );
    },
    retry: 1,
    staleTime: 15 * 60 * 1000, // 15 minutes, as this data might not change extremely frequently
  });

  const handleAddToCartClick = async (product: Product) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Debes iniciar sesión para añadir al carrito.");
      router.push(`/login?returnTo=${pathname}`);
    } else {
      // Ensure the product object passed to addToCart matches the store's Product type
      const productForCart: Product = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        image: product.image,
        category: product.category,
        stock: product.stock,
      };
      addToCartFromStore(productForCart);
      toast.success(`${product.name} añadido al carrito!`);
    }
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-white">
              Productos <span className="text-primary">más vendidos</span>
            </h2>
            <Link href="/tienda" className="text-primary hover:text-primary/80">
              Ver todos los productos
            </Link>
          </div>
          <div className="text-center py-10 text-gray-400">
            Cargando productos más vendidos...
          </div>
        </div>
      </section>
    );
  }

  if (error || !topSellingProducts || topSellingProducts.length === 0) {
    // Fallback to showing some products from the Zustand store if RPC fails or returns empty
    // Or a message if the store is also empty.
    const fallbackProducts: MappedProduct[] =
      allProductsFromStore.length > 0
        ? allProductsFromStore.slice(0, 3).map((p) => ({
            ...p,
            slug: p.slug || String(p.id), // Ensure slug is present
            totalSales: 0,
          }))
        : [];

    if (fallbackProducts.length === 0) {
      return (
        <section className="py-20 bg-gradient-to-b from-black to-gray-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12">
              <h2 className="text-3xl font-serif font-bold text-white">
                Productos <span className="text-primary">destacados</span>
              </h2>
              <Link
                href="/tienda"
                className="text-primary hover:text-primary/80"
              >
                Ver todos los productos
              </Link>
            </div>
            <div className="text-center py-10 text-gray-400">
              {error
                ? `Error: ${error.message}`
                : "No hay productos destacados disponibles en este momento."}
            </div>
          </div>
        </section>
      );
    }
    // If RPC failed but store has products, display them
    return (
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-white">
              Productos <span className="text-primary">destacados</span>{" "}
              (Fallback)
            </h2>
            <Link href="/tienda" className="text-primary hover:text-primary/80">
              Ver todos los productos
            </Link>
          </div>
          <RenderProductGrid
            products={fallbackProducts}
            handleAddToCartClick={handleAddToCartClick}
            hoveredProduct={hoveredProduct}
            setHoveredProduct={setHoveredProduct}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-white">
            Productos <span className="text-primary">más vendidos</span>
          </h2>
          <Link href="/tienda" className="text-primary hover:text-primary/80">
            Ver todos los productos
          </Link>
        </div>
        <RenderProductGrid
          products={topSellingProducts}
          handleAddToCartClick={handleAddToCartClick}
          hoveredProduct={hoveredProduct}
          setHoveredProduct={setHoveredProduct}
        />
      </div>
    </section>
  );
}

// Helper component to render the product grid to avoid repetition
interface RenderProductGridProps {
  products: MappedProduct[]; // Now expects MappedProduct for consistency
  handleAddToCartClick: (product: Product) => void;
  hoveredProduct: string | null;
  setHoveredProduct: (id: string | null) => void;
}

function RenderProductGrid({
  products,
  handleAddToCartClick,
  hoveredProduct,
  setHoveredProduct,
}: RenderProductGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <Link
          href={`/tienda/${product.slug}`}
          passHref
          legacyBehavior
          key={product.id}
          className="cursor-pointer"
        >
          <Card
            className="bg-gray-900 cursor-pointer border border-gray-800 overflow-hidden transition-all duration-300 hover:border-primary"
            onMouseEnter={() => setHoveredProduct(product.id)}
            onMouseLeave={() => setHoveredProduct(null)}
        >
          <div className="relative aspect-square overflow-hidden bg-gray-800">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">
                Sin Imagen
              </div>
            )}
          </div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-white text-lg">{product.name}</h3>
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
              Añadir al Carrito
            </Button>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}
