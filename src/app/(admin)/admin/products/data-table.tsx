"use client";

import React, { useState, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnFiltersState,
  getFilteredRowModel,
  VisibilityState,
} from "@tanstack/react-table";
import { useQuery, useQueryClient, QueryClient, type QueryKey } from "@tanstack/react-query";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { IProduct } from "@/interfaces/product"; // Use IProduct directly
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { ProductForm } from "./product-form";
import { ProductSheet } from "./product-sheet";
import { globalFilterFn } from "./columns";
import { ProductRow } from "@/types/product";
import { fetchFullProducts } from "@/lib/queries/product-queries"; // Ensure this is imported
// import { DataTablePagination } from "@/components/data-table-pagination"; // Commented out
// import { DataTableViewOptions } from "@/components/data-table-view-options"; // Commented out

interface DataTableProps<TValue> {
  columns: ColumnDef<IProduct, TValue>[];
  initialData: IProduct[];
  errorInitial?: Error | null;
}

export function ProductsDataTable<TValue>({ 
  columns, 
  initialData, 
  errorInitial 
}: DataTableProps<TValue>) {
  const queryClient = useQueryClient(); // Correct usage
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilterValue, setGlobalFilterValue] = React.useState('');
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const {
    data: tableData = [],
    isLoading: queryIsLoading,
    error: queryError,
  } = useQuery<IProduct[], Error, IProduct[], QueryKey>({
    queryKey: ["products"],
    queryFn: fetchFullProducts,
    initialData: initialData,
    staleTime: Infinity,
  });

  const effectiveIsLoading = queryIsLoading && tableData.length === 0 && initialData.length === 0;
  const effectiveError = queryError;
  
  const dataForTable = tableData.length > 0 ? tableData : initialData;

  const table = useReactTable({
    data: dataForTable,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, id, filterValue) => {
      return globalFilterFn(row.original as IProduct, id, String(filterValue));
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter: globalFilterValue,
    },
    meta: {
      editProduct: (product: IProduct) => {
        setEditingProduct(product);
        setSheetOpen(true);
      }
    }
  });

  useEffect(() => {
    if (!sheetOpen) {
      setEditingProduct(null);
    }
  }, [sheetOpen]);

  if (effectiveIsLoading) return <div className="text-center p-4">Cargando productos...</div>;
  if (effectiveError) return <div className="text-center p-4 text-red-600">Error al cargar productos: {effectiveError.message}</div>;
  if (!dataForTable.length) return <div className="text-center p-4">No se encontraron productos.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Filtrar todos los campos..."
          value={globalFilterValue ?? ''}
          onChange={event => setGlobalFilterValue(event.target.value)}
          className="max-w-sm"
        />
        {/* <DataTableViewOptions table={table} /> */}{/* Commented out */}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* <DataTablePagination table={table} /> */}{/* Commented out */}

      <ProductSheet
        productData={editingProduct ? (editingProduct as unknown as ProductRow) : undefined}
        isEditing={!!editingProduct}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
