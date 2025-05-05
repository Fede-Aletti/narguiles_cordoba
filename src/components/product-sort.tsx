"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductSortProps {
  value: string;
  onChange: (value: string) => void;
}

export function ProductSort({ value, onChange }: ProductSortProps) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-400">Sort by:</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px] bg-gray-900 border-gray-800 text-white focus:border-gold-500 focus:ring-gold-500/20">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent className="bg-gray-900 border-gray-800 text-white">
          <SelectItem value="featured">Featured</SelectItem>
          <SelectItem value="price-asc">Price: Low to High</SelectItem>
          <SelectItem value="price-desc">Price: High to Low</SelectItem>
          <SelectItem value="name-asc">Name: A to Z</SelectItem>
          <SelectItem value="name-desc">Name: Z to A</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
