"use client";

import type React from "react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, ShoppingCart, Star, Truck, Shield, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ShopProduct } from "@/lib/queries/shop-queries";
import { ProductStatus } from "@/interfaces/enums";

interface ProductInfoProps {
  product: ShopProduct;
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

  // Get category name
  const categoryName = product.category?.name || "";

  // Mock colors and sizes based on product type
  const colors =
    categoryName.toLowerCase().includes("hookah")
      ? ["Black", "Gold", "Silver", "Rose Gold"]
      : categoryName.toLowerCase().includes("accessor")
      ? ["Black", "Gold", "Silver"]
      : [];

  const sizes =
    categoryName.toLowerCase().includes("hookah") ? ["Small", "Medium", "Large"] : [];

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

  // Status label
  const statusDisplay = {
    'in_stock': 'En Stock',
    'out_of_stock': 'Agotado',
    'running_low': 'Poco Stock'
  }[product.status as ProductStatus] || '';

  return (
    <div className="space-y-6">
      {/* Product Title and Badges */}
      <div>
        {product.status === 'running_low' && (
          <Badge className="mb-2 bg-yellow-500 text-black hover:bg-yellow-600">
            ¡Últimas unidades!
          </Badge>
        )}
        <h1 className="font-serif text-3xl font-bold text-white md:text-4xl">
          {product.name}
        </h1>
      </div>

      {/* Price and Brand */}
      <div className="flex items-center justify-between">
        <div className="text-3xl font-bold text-gold-400">
          ${product.price?.toFixed(2) || "N/A"}
        </div>
        {product.brand && (
          <div className="text-gray-400">
            Marca: <span className="text-white">{product.brand.name}</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-400">{product.description || "Sin descripción disponible"}</p>

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
          <label className="text-sm font-medium text-white">Tamaño</label>
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

      {/* Stock Status */}
      <div className="text-sm">
        <span className="font-medium text-white">Estado: </span>
        <span className={`
          ${product.status === 'in_stock' ? 'text-green-500' : 
            product.status === 'running_low' ? 'text-yellow-500' : 
            'text-red-500'}
        `}>
          {statusDisplay}
        </span>
        {product.stock > 0 && (
          <span className="ml-2 text-gray-400">
            ({product.stock} {product.stock === 1 ? 'unidad' : 'unidades'} disponibles)
          </span>
        )}
      </div>

      {/* Quantity and Add to Cart */}
      <div className="flex flex-col space-y-4 pt-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
        <div className="w-full max-w-[120px]">
          <Input
            type="number"
            min="1"
            max={product.stock || 1}
            value={quantity}
            onChange={handleQuantityChange}
            className="bg-gray-900 border-gray-700 text-white"
            disabled={product.status === 'out_of_stock'}
          />
        </div>
        <Button
          className="flex-1 bg-gold-500 text-black hover:bg-gold-600"
          onClick={handleAddToCart}
          disabled={product.status === 'out_of_stock'}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.status === 'out_of_stock' ? 'Agotado' : 'Añadir al Carrito'}
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
          <span className="sr-only">Añadir a favoritos</span>
        </Button>
      </div>

      {/* Product Features */}
      <div className="space-y-4 rounded-lg bg-gray-900 p-4">
        <div className="flex items-center space-x-3">
          <Truck className="h-5 w-5 text-gold-400" />
          <div>
            <p className="text-sm font-medium text-white">Envío Gratis</p>
            <p className="text-xs text-gray-400">En compras superiores a $100</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Shield className="h-5 w-5 text-gold-400" />
          <div>
            <p className="text-sm font-medium text-white">Garantía de 2 años</p>
            <p className="text-xs text-gray-400">
              Cobertura completa para tu tranquilidad
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Award className="h-5 w-5 text-gold-400" />
          <div>
            <p className="text-sm font-medium text-white">
              Autenticidad Garantizada
            </p>
            <p className="text-xs text-gray-400">100% productos originales</p>
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
          <span className="text-gray-500">Categoría:</span>
          <span className="text-gray-400 capitalize">{product.category?.name || "Sin categoría"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Marca:</span>
          <span className="text-gray-400 capitalize">{product.brand?.name || "Sin marca"}</span>
        </div>
      </div>
    </div>
  );
}
