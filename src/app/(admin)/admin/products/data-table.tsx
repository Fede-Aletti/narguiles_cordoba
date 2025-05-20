"use client";

import * as React from "react";
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
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";

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

interface DataTableProps<TData extends IProduct, TValue> { // Use IProduct
  columns: ColumnDef<TData, TValue>[];
  initialData?: TData[];
}

export function ProductsDataTable<TData extends IProduct, TValue>({
  columns,
  initialData,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilterValue, setGlobalFilterValue] = React.useState('')

  const [editingProduct, setEditingProduct] = React.useState<TData | null>(
    null
  );
  const [sheetOpen, setSheetOpen] = React.useState(false);

  React.useEffect(() => {
    const handleEditProduct = (e: any) => {
      const productDetail = e.detail as TData; // Assuming e.detail is of type TData (IProduct)
      setEditingProduct(productDetail);
      setSheetOpen(true);
    };

    window.addEventListener("EDIT_PRODUCT", handleEditProduct as EventListener);
    return () => {
      window.removeEventListener("EDIT_PRODUCT", handleEditProduct as EventListener);
    };
  }, []);

  const {
    data: productsData,
    isLoading,
    error,
  } = useQuery<TData[], Error, TData[], [string]>({
    queryKey: ["products"],
    initialData: initialData,
    staleTime: Infinity,
  });

  const table = useReactTable({
    data: productsData ?? initialData ?? [], 
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, id, filterValue) => {
      // Ensure row.original is compatible with globalFilterFn expectations
      return globalFilterFn(row.original as IProduct, id, String(filterValue));
    },
    state: {
      sorting,
      columnFilters,
      globalFilter: globalFilterValue,
    },
    onGlobalFilterChange: setGlobalFilterValue,
  });

  // Adjust loading and error states based on initialData presence
  const effectiveIsLoading = isLoading && !initialData;
  const effectiveError = error;

  if (effectiveIsLoading) return <div>Cargando productos...</div>;
  if (effectiveError) return <div>Error al cargar productos: {effectiveError.message}</div>;
  if (!productsData && !initialData?.length) return <div>No se encontraron productos.</div>;

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrar por nombre..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
          aria-label="Filtrar productos por nombre"
        />
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
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label="Go to previous page"
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label="Go to next page"
        >
          Siguiente
        </Button>
      </div>

      {/* ProductSheet for editing - ensure editingProduct is compatible with ProductSheet props */}
      {editingProduct && (
        <ProductSheet
          productData={editingProduct as ProductRow} // Explicitly cast if ProductSheet expects IProduct
          isEditing={true}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          key={`edit-product-${editingProduct.id}`}
        />
      )}
    </div>
  );
}
