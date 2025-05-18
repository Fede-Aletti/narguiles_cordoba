// @ts-nocheck
'use client'

import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, ArrowUpDown, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Media, ProductRow } from '@/types/product' // Asegúrate que la ruta es correcta
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

// Helper para formatear moneda
const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount) // Ajusta la localización
}

// Función de filtrado global personalizada para buscar en múltiples campos
export function globalFilterFn(row: ProductRow, id: string, filterValue: string) {
  const searchTerm = filterValue.toLowerCase();
  if (!searchTerm) return true;
  
  // Campos en los que buscar (strings)

  const productString = `${row.name} ${row.slug} ${row.category?.name} ${row.brand?.name} ${row.price_group?.name} ${row.status?.toString()} ${row.stock?.toString()} ${row.price?.toString()}`

  // Buscar en cada campo
  return productString.toLowerCase().includes(searchTerm)
}

export const columns: ColumnDef<ProductRow>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          aria-label="Sort by ID"
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          aria-label="Sort by Name"
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'slug',
    header: 'Slug',
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
  },
  {
    accessorKey: 'price',
    header: 'Precio',
    cell: ({ row }) => formatCurrency(row.original.price),
  },
  {
    accessorKey: 'category.name',
    header: 'Categoría',
    cell: ({ row }) => row.original.category?.name || '-',
  },
  {
    accessorKey: 'brand.name',
    header: 'Marca',
    cell: ({ row }) => row.original.brand?.name || '-',
  },
   {
    accessorKey: 'price_group.name',
    header: 'Grupo Precio',
    cell: ({ row }) => row.original.price_group?.name || '-',
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => {
      const status = row.original.status
      let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default'
      if (status === 'out_of_stock') variant = 'destructive'
      if (status === 'running_low') variant = 'secondary' // o 'outline' o como prefieras
      return <Badge variant={variant} className="capitalize">{status.replace('_', ' ')}</Badge>
    },
  },
  {
    accessorKey: 'product_media',
    header: 'Imagen',
    cell: ({ row }) => {
      const product = row.original;
      const firstImage = product.product_media?.[0]?.media as unknown as Media;

      
      return firstImage ? (
        <div className="relative h-10 w-10 rounded overflow-hidden">
          <Image 
            src={firstImage.url} 
            alt={firstImage.alt || product.name}
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
      ) : (
        <div className="h-10 w-10 bg-gray-100 flex items-center justify-center rounded">
          <ImageIcon className="h-4 w-4 text-gray-400" />
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const product = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" aria-label={`Actions for product ${product.name}`}>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(String(product.id))}
            >
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.dispatchEvent(new CustomEvent('EDIT_PRODUCT', { detail: product }))}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Eliminar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 