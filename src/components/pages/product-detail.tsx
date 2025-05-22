"use client";
// @ts-nocheck

import { ProductImageCarousel } from "../product/product-image-carousel";
import { ProductInfo } from "../product/product-info";
import { ProductTabs } from "../product/product-tabs";
import { RelatedProducts } from "../product/related-products";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductBySlug } from "@/lib/queries/shop-queries";

interface ProductDetailProps {
  slug: string;
}

export function ProductDetail({ slug }: ProductDetailProps) {
  const { data: product, isLoading, error } = useProductBySlug(slug);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    notFound();
  }

  // Convert media to carousel format
  const carouselImages = product.images && product.images.length > 0
    ? product.images.map((image, i) => ({
        id: image.id,
        src: image.url,
        alt: image.alt_text || `${product.name} - Image ${i + 1}`,
      }))
    : Array(1).fill(null).map((_, i) => ({
        id: `placeholder-${i + 1}`,
        src: `/placeholder.svg?height=600&width=600&text=No+Product+Image`,
        alt: `${product.name} - No Image`,
      }));

  return (
    <div className="bg-black -mt-24">
      {/* Breadcrumb */}
      <div className="bg-gray-900 pt-24">
        <div className="container px-4 py-4 md:px-6">
          <nav className="flex text-sm">
            <a href="/" className="text-gray-400 hover:text-gold-400">
              Home
            </a>
            <span className="mx-2 text-gray-600">/</span>
            <a href="/tienda" className="text-gray-400 hover:text-gold-400">
              Tienda
            </a>
            {product.category && (
              <>
                <span className="mx-2 text-gray-600">/</span>
                <span className="text-gray-400">
                  {product.category.name}
                </span>
              </>
            )}
            <span className="mx-2 text-gray-600">/</span>
            <span className="text-gold-400">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          {/* Product Images */}
          <ProductImageCarousel images={carouselImages} />

          {/* Product Info */}
          <ProductInfo product={product} />
        </div>
      </div>

      {/* Product Tabs (Description, Specifications, Reviews) */}
      <ProductTabs product={product} />

      {/* Related Products */}
      {product.category_id && (
        <RelatedProducts
          currentProductId={product.id}
          categoryId={product.category_id}
        />
      )}
    </div>
  );
}

// Loading skeleton for product detail
function ProductDetailSkeleton() {
  return (
    <div className="bg-black">
      {/* Breadcrumb Skeleton */}
      <div className="bg-gray-900">
        <div className="container px-4 py-4 md:px-6">
          <Skeleton className="h-5 w-64 bg-gray-800" />
        </div>
      </div>

      {/* Product Detail Skeleton */}
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          {/* Product Images Skeleton */}
          <div>
            <Skeleton className="aspect-square w-full rounded-lg bg-gray-800" />
            <div className="mt-4 flex space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-20 rounded-md bg-gray-800" />
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4 bg-gray-800" />
            <Skeleton className="h-6 w-1/3 bg-gray-800" />
            <Skeleton className="h-4 w-1/4 bg-gray-800" />
            <div className="space-y-4">
              <Skeleton className="h-24 w-full bg-gray-800" />
              <Skeleton className="h-10 w-full bg-gray-800" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="container px-4 py-8 md:px-6">
        <Skeleton className="h-12 w-full bg-gray-800 mb-6" />
        <Skeleton className="h-40 w-full bg-gray-800" />
      </div>

      {/* Related Products Skeleton */}
      <div className="container px-4 py-8 md:px-6">
        <Skeleton className="h-8 w-48 bg-gray-800 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-lg bg-gray-800" />
          ))}
        </div>
      </div>
    </div>
  );
}
