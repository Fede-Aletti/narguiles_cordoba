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
import { fetchProducts } from "@/lib/queries/product-queries"; // Ajusta la ruta
import type { ProductFormData, ProductRow } from "@/types/product"; // Ajusta la ruta
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

interface DataTableProps<TData extends ProductRow, TValue> {
  columns: ColumnDef<TData, TValue>[];
}

export function ProductsDataTable<TData extends ProductRow, TValue>({
  columns,
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

  // Efecto para escuchar el evento de edición
  React.useEffect(() => {
    const handleEditProduct = (e: any) => {
      setEditingProduct(e.detail);
      setSheetOpen(true); // Abre el Sheet automáticamente
    };

    window.addEventListener("EDIT_PRODUCT", handleEditProduct);
    return () => {
      window.removeEventListener("EDIT_PRODUCT", handleEditProduct);
    };
  }, []);

  const {
    data: productsData,
    isLoading,
    error,
  } = useQuery<TData[]>({
    queryKey: ["products"],
    queryFn: fetchProducts as () => Promise<TData[]>,
  });

  const table = useReactTable({
    data: productsData ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, id, filterValue) => {
      return globalFilterFn(row.original, id, String(filterValue));
    },
    state: {
      sorting,
      columnFilters,
      globalFilter: globalFilterValue,
    },
    onGlobalFilterChange: setGlobalFilterValue,
  });

  if (isLoading) return <div>Cargando productos...</div>;
  if (error) return <div>Error al cargar productos: {error.message}</div>;
  if (!productsData) return <div>No se encontraron productos.</div>;

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
          aria-label="Filter products by name"
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

      {editingProduct && (
        <ProductSheet
          productData={editingProduct}
          isEditing={true}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          key={`edit-product-${editingProduct.id}`}
        />
      )}
    </div>
  );
}
