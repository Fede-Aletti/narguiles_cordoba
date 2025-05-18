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
      <span className="text-sm text-gray-400">Ordenar por:</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px] bg-gray-900 border-gray-800 text-white focus:border-gold-500 focus:ring-gold-500/20">
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent className="bg-gray-900 border-gray-800 text-white">
          <SelectItem value="featured">Destacados</SelectItem>
          <SelectItem value="price-asc">Precio: Bajo a Alto</SelectItem>
          <SelectItem value="price-desc">Precio: Alto a Bajo</SelectItem>
          <SelectItem value="name-asc">Nombre: A a Z</SelectItem>
          <SelectItem value="name-desc">Name: Z to A</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
