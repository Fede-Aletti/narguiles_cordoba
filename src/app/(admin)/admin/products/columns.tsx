'use client'

import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ProductRow } from '@/types/product' // Asegúrate que la ruta es correcta
import { Badge } from '@/components/ui/badge'

// Helper para formatear moneda
const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount) // Ajusta la localización
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