"use client";
import { useStore } from "@/lib/store";
import { ProductImageCarousel } from "../product/product-image-carousel";
import { ProductInfo } from "../product/product-info";



import { notFound } from "next/navigation";
import { ProductTabs } from "../product/product-tabs";
import { RelatedProducts } from "../product/related-products";

interface ProductDetailProps {
  slug: string;
}

export function ProductDetail({ slug }: ProductDetailProps) {
  const { products } = useStore();
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  // Generate placeholder images for the carousel
  const images = Array(5)
    .fill(null)
    .map((_, i) => ({
      id: i + 1,
      src: `/placeholder.svg?height=600&width=600&text=Product+Image+${i + 1}`,
      alt: `${product.name} - Image ${i + 1}`,
    }));

  return (
    <div className="bg-black">
      {/* Breadcrumb */}
      <div className="bg-gray-900">
        <div className="container px-4 py-4 md:px-6">
          <nav className="flex text-sm">
            <a href="/" className="text-gray-400 hover:text-gold-400">
              Home
            </a>
            <span className="mx-2 text-gray-600">/</span>
            <a href="/shop" className="text-gray-400 hover:text-gold-400">
              Shop
            </a>
            <span className="mx-2 text-gray-600">/</span>
            <a
              href={`/shop/${product.category}`}
              className="text-gray-400 hover:text-gold-400"
            >
              {product.category.charAt(0).toUpperCase() +
                product.category.slice(1)}
            </a>
            <span className="mx-2 text-gray-600">/</span>
            <span className="text-gold-400">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          {/* Product Images */}
          <ProductImageCarousel images={images} />

          {/* Product Info */}
          <ProductInfo product={product} />
        </div>
      </div>

      {/* Product Tabs (Description, Specifications, Reviews) */}
      <ProductTabs product={product} />

      {/* Related Products */}
      <RelatedProducts
        currentProductId={product.id}
        category={product.category}
      />
    </div>
  );
}
