"use client";

import type React from "react";

import { useState } from "react";
import { useStore, type Product } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, ShoppingCart, Star, Truck, Shield, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const { addToCart } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    undefined
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    undefined
  );
  const [isFavorite, setIsFavorite] = useState(false);

  // Mock colors and sizes based on product type
  const colors =
    product.category === "hookahs"
      ? ["Black", "Gold", "Silver", "Rose Gold"]
      : product.category === "accessories"
      ? ["Black", "Gold", "Silver"]
      : [];

  const sizes =
    product.category === "hookahs" ? ["Small", "Medium", "Large"] : [];

  const handleAddToCart = () => {
    addToCart({
      ...product,
      // In a real app, you might want to include the selected options
      // color: selectedColor,
      // size: selectedSize,
    });
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  return (
    <div className="space-y-6">
      {/* Product Title and Badges */}
      <div>
        {product.new && (
          <Badge className="mb-2 bg-gold-500 text-black hover:bg-gold-600">
            New Arrival
          </Badge>
        )}
        <h1 className="font-serif text-3xl font-bold text-white md:text-4xl">
          {product.name}
        </h1>
      </div>

      {/* Price and Rating */}
      <div className="flex items-center justify-between">
        <div className="text-3xl font-bold text-gold-400">
          ${product.price.toFixed(2)}
        </div>
        <div className="flex items-center">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= 4 ? "fill-gold-500 text-gold-500" : "text-gray-600"
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-400">(24 reviews)</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-400">{product.description}</p>

      {/* Color Selection */}
      {colors.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-white">Color</label>
          <div className="flex space-x-3">
            {colors.map((color) => {
              const colorClass =
                color === "Black"
                  ? "bg-gray-900"
                  : color === "Gold"
                  ? "bg-amber-500"
                  : color === "Silver"
                  ? "bg-gray-300"
                  : color === "Rose Gold"
                  ? "bg-rose-400"
                  : "bg-gray-500";

              return (
                <button
                  key={color}
                  className={`h-8 w-8 rounded-full border-2 ${
                    selectedColor === color
                      ? "border-gold-400"
                      : "border-transparent"
                  } ${colorClass}`}
                  onClick={() => setSelectedColor(color)}
                  title={color}
                >
                  <span className="sr-only">{color}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Selection */}
      {sizes.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-white">Size</label>
          <div className="flex space-x-3">
            {sizes.map((size) => (
              <button
                key={size}
                className={`flex h-10 w-16 items-center justify-center rounded border ${
                  selectedSize === size
                    ? "border-gold-500 bg-gold-500/10 text-gold-400"
                    : "border-gray-700 text-gray-400 hover:border-gray-600"
                }`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity and Add to Cart */}
      <div className="flex flex-col space-y-4 pt-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
        <div className="w-full max-w-[120px]">
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={handleQuantityChange}
            className="bg-gray-900 border-gray-700 text-white"
          />
        </div>
        <Button
          className="flex-1 bg-gold-500 text-black hover:bg-gold-600"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
        <Button
          variant="outline"
          size="icon"
          className={`border-gray-700 ${
            isFavorite ? "text-red-500" : "text-gray-400"
          } hover:border-gray-600`}
          onClick={() => setIsFavorite(!isFavorite)}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500" : ""}`} />
          <span className="sr-only">Add to wishlist</span>
        </Button>
      </div>

      {/* Product Features */}
      <div className="space-y-4 rounded-lg bg-gray-900 p-4">
        <div className="flex items-center space-x-3">
          <Truck className="h-5 w-5 text-gold-400" />
          <div>
            <p className="text-sm font-medium text-white">Free Shipping</p>
            <p className="text-xs text-gray-400">On orders over $100</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Shield className="h-5 w-5 text-gold-400" />
          <div>
            <p className="text-sm font-medium text-white">2-Year Warranty</p>
            <p className="text-xs text-gray-400">
              Full coverage for peace of mind
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Award className="h-5 w-5 text-gold-400" />
          <div>
            <p className="text-sm font-medium text-white">
              Authenticity Guaranteed
            </p>
            <p className="text-xs text-gray-400">100% genuine products</p>
          </div>
        </div>
      </div>

      {/* SKU and Categories */}
      <div className="space-y-2 border-t border-gray-800 pt-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">SKU:</span>
          <span className="text-gray-400">
            LH-{product.id.toString().padStart(4, "0")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Category:</span>
          <span className="text-gray-400 capitalize">{product.category}</span>
        </div>
        {product.material && (
          <div className="flex justify-between">
            <span className="text-gray-500">Material:</span>
            <span className="text-gray-400 capitalize">{product.material}</span>
          </div>
        )}
      </div>
    </div>
  );
}
