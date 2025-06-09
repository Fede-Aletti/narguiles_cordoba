"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { IBrand } from "@/interfaces/brand";
import { ICategory } from "@/interfaces/category";

interface ProductFiltersProps {
  categories: ICategory[];
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  brands: IBrand[];
  selectedBrands: string[];
  onBrandChange: (brands: string[]) => void;
}

export function ProductFilters({
  categories,
  selectedCategories,
  onCategoryChange,
  brands,
  selectedBrands,
  onBrandChange,
}: ProductFiltersProps) {
  // Handle category checkbox change
  const handleCategoryChange = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoryChange(selectedCategories.filter((id) => id !== categoryId));
    } else {
      onCategoryChange([...selectedCategories, categoryId]);
    }
  };

  // Handle brand checkbox change
  const handleBrandChange = (brandId: string) => {
    if (selectedBrands.includes(brandId)) {
      onBrandChange(selectedBrands.filter((id) => id !== brandId));
    } else {
      onBrandChange([...selectedBrands, brandId]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Categoría</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => handleCategoryChange(category.id)}
                className="border-gray-600 data-[state=checked]:bg-gold-500 data-[state=checked]:border-gold-500"
              />
              <Label
                htmlFor={`category-${category.id}`}
                className="text-gray-300 cursor-pointer"
              >
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Marca</h3>
        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
          {brands.map((brand) => (
            <div key={brand.id} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand.id}`}
                checked={selectedBrands.includes(brand.id)}
                onCheckedChange={() => handleBrandChange(brand.id)}
                className="border-gray-600 data-[state=checked]:bg-gold-500 data-[state=checked]:border-gold-500"
              />
              <Label
                htmlFor={`brand-${brand.id}`}
                className="text-gray-300 cursor-pointer"
              >
                {brand.name}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
