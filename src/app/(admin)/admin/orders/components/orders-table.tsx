"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnFiltersState,
  PaginationState,
  FilterFn,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { IOrder } from "@/interfaces/order";
import { OrderStatus } from "@/interfaces/enums";
import { Edit } from 'lucide-react';
import { OrderDetailSheet } from "@/components/admin/orders/order-detail-sheet";
import { EnrichedOrder, useAdminOrders, AdminOrdersParams } from "@/lib/queries/order-queries";
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '../../../../../hooks/use-debounce';

// Helper to get badge variant based on status
const getOrderStatusBadgeVariant = (status: OrderStatus): 'default' | 'secondary' | 'destructive' | 'outline' | null | undefined => {
  switch (status) {
    case OrderStatus.PLACED:
    case OrderStatus.IN_CART: 
      return "secondary";
    case OrderStatus.CONFIRMED:
      return "default";
    case OrderStatus.PROCESSED:
      return "default";
    case OrderStatus.PICKUP:
      return "secondary";
    case OrderStatus.DELIVERED:
      return "default";
    default:
      return "outline";
  }
};

// Helper to format currency
const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
};

// Función simple para convertir una orden a texto plano para búsqueda
const orderToSearchableText = (order: EnrichedOrder): string => {
  // Convertimos todos los campos relevantes a string y los unimos
  const searchableFields = [
    order.id,
    order.user?.first_name || '',
    order.user?.last_name || '',
    order.user?.email || '',
    order.status,
    order.status_display,
    new Date(order.created_at).toLocaleDateString(),
    String(order.total_amount),
    String(order.total_items)
  ];
  
  return searchableFields
    .filter(Boolean) // Eliminar campos falsy (null, undefined, etc)
    .map(field => String(field).toLowerCase()) // Convertir todo a string minúscula
    .join(' '); // Unir con espacios
};

// Función de filtrado global simple
const globalFilterFn: FilterFn<EnrichedOrder> = (row, columnId, filterValue) => {
  // Si no hay valor de filtro, mostrar la fila
  if (!filterValue || typeof filterValue !== 'string') return true;
  
  // Convertir la fila a texto plano y verificar si incluye el término de búsqueda
  const searchText = orderToSearchableText(row.original);
  return searchText.includes(filterValue.toLowerCase());
};

export function OrdersTable() {
  const queryClient = useQueryClient();
  
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const adminOrderParams: AdminOrdersParams = {
    pageIndex,
    pageSize,
    sorting,
    // Ya no pasamos globalFilter a la query
  };

  const { data: paginatedData, isLoading, isError, error, isFetching } = useAdminOrders(adminOrderParams);

  const ordersData = useMemo(() => paginatedData?.orders || [], [paginatedData]);
  const totalCount = useMemo(() => paginatedData?.totalCount || 0, [paginatedData]);
  const pageCount = useMemo(() => paginatedData?.pageCount || 0, [paginatedData]);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedOrderForSheet, setSelectedOrderForSheet] = useState<EnrichedOrder | null>(null);

  const handleOpenSheet = (order: EnrichedOrder) => {
    setSelectedOrderForSheet(order);
    setIsSheetOpen(true);
  };

  const handleOrderSheetUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-orders', adminOrderParams] });
  };

  const columns: ColumnDef<EnrichedOrder>[] = useMemo(() => [
    { accessorKey: "id", header: "ID Orden", cell: ({row}) => <div className="truncate w-28" title={row.original.id}>{row.original.id.substring(0,8)}</div> },
    {
      accessorKey: "user",
      header: "Cliente",
      cell: ({ row }) => {
        const user = row.original.user;
        return user ? `${user.first_name || ''} ${user.last_name || ''} (${user.email || 'N/A'})` : "Invitado";
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <Badge variant={getOrderStatusBadgeVariant(row.original.status as OrderStatus)} className="capitalize">
          {row.original.status_display || row.original.status.replace('_', ' ')}
        </Badge>
      ),
    },
    { 
      accessorKey: "total_amount", 
      header: "Total", 
      cell: ({row}) => formatCurrency(row.original.total_amount), 
      enableSorting: true,
    },
    {
      accessorKey: "total_items",
      header: "Items",
    },
    {
      accessorKey: "created_at",
      header: "Fecha Creación",
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
      enableSorting: true,
    },
    {
      id: 'actions',
      header: "Acciones",
      cell: ({ row }) => (
        <Button variant="outline" size="sm" onClick={() => handleOpenSheet(row.original)} aria-label="Ver/Editar orden">
          <Edit className="h-4 w-4 mr-1" /> Ver/Editar
        </Button>
      ),
    },
  ], []);

  const table = useReactTable({
    data: ordersData,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter: debouncedSearch,
      pagination: { pageIndex, pageSize },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setSearch,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: globalFilterFn,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: false,
    pageCount: pageCount,
    rowCount: totalCount,
  });

  if (isLoading && !paginatedData) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3 bg-gray-700" />
        <div className="rounded-md border border-gray-700">
          <Table>
            <TableHeader>
              <TableRow className="border-b-gray-700">
                {columns.map((col, idx) => <TableHead key={idx} className="h-12 text-gray-300"><Skeleton className="h-5 w-3/4 bg-gray-600" /></TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(pageSize)].map((_, i) => (
                <TableRow key={i} className="border-b-gray-700">
                  {columns.map((col, j) => <TableCell key={j}><Skeleton className="h-5 w-full bg-gray-600" /></TableCell>)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Skeleton className="h-10 w-1/4 ml-auto bg-gray-700" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar orden... (ID, cliente, email, estado, fecha, monto)"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="max-w-sm bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-gold-500 focus:border-gold-500"
      />
      {isFetching && <div className="text-sm text-gold-400">Actualizando datos...</div>}
      {isError && <div className="text-sm text-red-500">Error al cargar órdenes: {error?.message}</div>}
      <div className="rounded-md border border-gray-700">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className="border-b-gray-700">
                {headerGroup.headers.map(header => (
                  <TableHead 
                    key={header.id} 
                    colSpan={header.colSpan} 
                    className="text-gray-300 cursor-pointer hover:bg-gray-700"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: ' ↑',
                      desc: ' ↓',
                    }[header.column.getIsSorted() as string] ?? null}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow 
                  key={row.original.id}
                  data-state={row.getIsSelected() && "selected"} 
                  className="border-b-gray-700 hover:bg-gray-800 transition-colors"
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="text-gray-300">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="border-b-gray-700">
                <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                  {isError ? "Error al cargar" : "No se encontraron órdenes."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <span className="text-sm text-gray-400">
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()} ({totalCount} órdenes)
        </span>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white"
          >
            Primera
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white"
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white"
          >
            Siguiente
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white"
          >
            Última
          </Button>
        </div>
      </div>
      <OrderDetailSheet 
        order={selectedOrderForSheet} 
        isOpen={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
        onOrderUpdate={handleOrderSheetUpdate} 
      />
    </div>
  );
} 