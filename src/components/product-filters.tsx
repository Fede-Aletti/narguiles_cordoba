"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface ProductFiltersProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  priceRange: [number, number];
  maxPrice: number;
  onPriceRangeChange: (range: [number, number]) => void;
}

export function ProductFilters({
  categories,
  selectedCategories,
  onCategoryChange,
  priceRange,
  maxPrice,
  onPriceRangeChange,
}: ProductFiltersProps) {
  // Handle category checkbox change
  const handleCategoryChange = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter((c) => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  // Format category name for display
  const formatCategoryName = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Category</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => handleCategoryChange(category)}
                className="border-gray-600 data-[state=checked]:bg-gold-500 data-[state=checked]:border-gold-500"
              />
              <Label
                htmlFor={`category-${category}`}
                className="text-gray-300 cursor-pointer"
              >
                {formatCategoryName(category)}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Price Range</h3>
        <div className="space-y-6">
          <Slider
            defaultValue={[0, maxPrice]}
            value={priceRange}
            max={maxPrice}
            step={1}
            onValueChange={(value) =>
              onPriceRangeChange(value as [number, number])
            }
            className="py-4"
          />
          <div className="flex items-center justify-between">
            <div className="bg-gray-800 px-3 py-1.5 rounded text-sm text-white">
              ${priceRange[0]}
            </div>
            <div className="bg-gray-800 px-3 py-1.5 rounded text-sm text-white">
              ${priceRange[1]}
            </div>
          </div>
        </div>
      </div>

      {/* Material Filter */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Material</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="material-glass"
              className="border-gray-600 data-[state=checked]:bg-gold-500 data-[state=checked]:border-gold-500"
            />
            <Label
              htmlFor="material-glass"
              className="text-gray-300 cursor-pointer"
            >
              Glass
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="material-metal"
              className="border-gray-600 data-[state=checked]:bg-gold-500 data-[state=checked]:border-gold-500"
            />
            <Label
              htmlFor="material-metal"
              className="text-gray-300 cursor-pointer"
            >
              Metal
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="material-crystal"
              className="border-gray-600 data-[state=checked]:bg-gold-500 data-[state=checked]:border-gold-500"
            />
            <Label
              htmlFor="material-crystal"
              className="text-gray-300 cursor-pointer"
            >
              Crystal
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="material-wood"
              className="border-gray-600 data-[state=checked]:bg-gold-500 data-[state=checked]:border-gold-500"
            />
            <Label
              htmlFor="material-wood"
              className="text-gray-300 cursor-pointer"
            >
              Wood
            </Label>
          </div>
        </div>
      </div>

      {/* Size Filter */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Size</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="size-small"
              className="border-gray-600 data-[state=checked]:bg-gold-500 data-[state=checked]:border-gold-500"
            />
            <Label
              htmlFor="size-small"
              className="text-gray-300 cursor-pointer"
            >
              Small
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="size-medium"
              className="border-gray-600 data-[state=checked]:bg-gold-500 data-[state=checked]:border-gold-500"
            />
            <Label
              htmlFor="size-medium"
              className="text-gray-300 cursor-pointer"
            >
              Medium
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="size-large"
              className="border-gray-600 data-[state=checked]:bg-gold-500 data-[state=checked]:border-gold-500"
            />
            <Label
              htmlFor="size-large"
              className="text-gray-300 cursor-pointer"
            >
              Large
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}
