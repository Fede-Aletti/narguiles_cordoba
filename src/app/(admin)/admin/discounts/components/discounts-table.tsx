"use client";

import React, { useState, useMemo } from 'react';
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { IDiscount } from "@/interfaces/discount";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash2, Eye, RotateCcw } from 'lucide-react';
import { DiscountForm, type DiscountFormValues } from './discount-form';
import { fetchDiscounts, createDiscount, updateDiscount, deleteDiscount, restoreDiscount, type CreateDiscountPayload, type UpdateDiscountPayload } from '@/actions/discount-actions';
import { format } from 'date-fns';

interface DiscountsTableProps {
  initialDiscounts: IDiscount[];
}

const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
};

export function DiscountsTable({ initialDiscounts }: DiscountsTableProps) {
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<IDiscount | null>(null);
  const [deletingDiscountId, setDeletingDiscountId] = useState<string | null>(null);
  const [restoringDiscountId, setRestoringDiscountId] = useState<string | null>(null);

  const { data: discounts = initialDiscounts, isLoading: queryLoading } = useQuery<IDiscount[], Error>({
    queryKey: ['discounts', showDeleted],
    queryFn: fetchDiscounts, 
    initialData: initialDiscounts,
  });
  
  const displayDiscounts = useMemo(() => {
    return discounts.filter(d => showDeleted ? true : !d.deleted_at);
  }, [discounts, showDeleted]);

  const createMutation = useMutation<IDiscount, Error, CreateDiscountPayload>({
    mutationFn: createDiscount,
    onSuccess: (newDiscount) => {
      toast.success("Descuento creado con éxito.");
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      setIsFormOpen(false);
    },
    onError: (error) => toast.error(`Error al crear descuento: ${error.message}`),
  });

  const updateMutation = useMutation<IDiscount, Error, { id: string; payload: UpdateDiscountPayload }>({
    mutationFn: (vars) => updateDiscount(vars.id, vars.payload),
    onSuccess: (updatedDiscount) => {
      toast.success("Descuento actualizado con éxito.");
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      setIsFormOpen(false);
      setEditingDiscount(null);
    },
    onError: (error) => toast.error(`Error al actualizar descuento: ${error.message}`),
  });

  const deleteMutation = useMutation<{id: string}, Error, string>({
    mutationFn: deleteDiscount,
    onSuccess: () => {
      toast.success("Descuento eliminado (soft delete).");
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      setDeletingDiscountId(null);
    },
    onError: (error) => toast.error(`Error al eliminar descuento: ${error.message}`),
  });

  const restoreMutation = useMutation<IDiscount, Error, string>({
    mutationFn: restoreDiscount,
    onSuccess: () => {
      toast.success("Descuento restaurado con éxito.");
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      setRestoringDiscountId(null);
    },
    onError: (error) => toast.error(`Error al restaurar descuento: ${error.message}`),
  });

  const handleFormSubmit = (values: DiscountFormValues) => {
    const payload: CreateDiscountPayload | UpdateDiscountPayload = {
        ...values,
        start_date: values.start_date ? values.start_date.toISOString() : undefined,
        end_date: values.end_date ? values.end_date.toISOString() : undefined,
    };
    if (editingDiscount) {
      updateMutation.mutate({ id: editingDiscount.id, payload });
    } else {
      createMutation.mutate(payload as CreateDiscountPayload);
    }
  };

  const columns: ColumnDef<IDiscount>[] = useMemo(() => [
    { accessorKey: "name", header: "Nombre" },
    { accessorKey: "code", header: "Código", cell: ({row}) => row.original.code || '-' },
    { accessorKey: "discount_type", header: "Tipo", cell: ({row}) => row.original.discount_type === 'percentage' ? 'Porcentaje' : 'Monto Fijo' }, 
    { accessorKey: "value", header: "Valor", cell: ({row}) => row.original.discount_type === 'percentage' ? `${row.original.value}%` : formatCurrency(row.original.value) },
    { accessorKey: "is_active", header: "Activo", cell: ({row}) => <Badge variant={row.original.is_active && !row.original.deleted_at ? "default" : "destructive"}>{row.original.deleted_at ? 'Eliminado' : row.original.is_active ? "Sí" : "No"}</Badge> },
    { accessorKey: "start_date", header: "Inicio", cell: ({row}) => row.original.start_date ? format(new Date(row.original.start_date), "P") : '-'}, 
    { accessorKey: "end_date", header: "Fin", cell: ({row}) => row.original.end_date ? format(new Date(row.original.end_date), "P") : '-'}, 
    {
      id: 'actions',
      cell: ({ row }) => {
        const discount = row.original;
        if (discount.deleted_at) {
          return (
            <Button variant="outline" size="sm" onClick={() => setRestoringDiscountId(discount.id)} disabled={restoreMutation.isPending}>
              <RotateCcw className="mr-2 h-4 w-4" /> Restaurar
            </Button>
          );
        }
        return (
          <div className="space-x-2">
            <Button variant="outline" size="icon" onClick={() => { setEditingDiscount(discount); setIsFormOpen(true); }} aria-label="Editar descuento">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={() => setDeletingDiscountId(discount.id)} aria-label="Eliminar descuento">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ], [restoreMutation.isPending]);

  const table = useReactTable({
    data: displayDiscounts,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Buscar descuentos... (nombre, código)"
          value={globalFilter ?? ''}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <div className="space-x-2">
            <Button variant="outline" onClick={() => setShowDeleted(!showDeleted)}>
                {showDeleted ? "Ocultar Eliminados" : "Mostrar Eliminados"}
            </Button>
            <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
                setIsFormOpen(isOpen);
                if (!isOpen) setEditingDiscount(null);
            }}>
                <DialogTrigger asChild>
                    <Button onClick={() => { setEditingDiscount(null); setIsFormOpen(true); }} >
                        <PlusCircle className="mr-2 h-4 w-4" /> Crear Descuento
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingDiscount ? "Editar Descuento" : "Crear Nuevo Descuento"}</DialogTitle>
                    </DialogHeader>
                    <DiscountForm 
                        setOpen={setIsFormOpen} 
                        onSubmit={handleFormSubmit} 
                        discountData={editingDiscount || undefined} 
                        isEditing={!!editingDiscount} 
                        loading={createMutation.isPending || updateMutation.isPending}
                    />
                </DialogContent>
            </Dialog>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className={row.original.deleted_at ? "bg-muted/50 text-muted-foreground line-through" : ""}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No se encontraron descuentos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Siguiente</Button>
      </div>

      <AlertDialog open={!!deletingDiscountId} onOpenChange={(isOpen) => !isOpen && setDeletingDiscountId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción marcará el descuento como eliminado (soft delete). Podrás restaurarlo.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingDiscountId && deleteMutation.mutate(deletingDiscountId)} disabled={deleteMutation.isPending} className="bg-red-600 hover:bg-red-700">
              {deleteMutation.isPending ? "Eliminando..." : "Confirmar Eliminación"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!restoringDiscountId} onOpenChange={(isOpen) => !isOpen && setRestoringDiscountId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Restaurar Descuento?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción restaurará el descuento y volverá a estar activo si cumple las condiciones de fechas.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => restoringDiscountId && restoreMutation.mutate(restoringDiscountId)} disabled={restoreMutation.isPending}>
              {restoreMutation.isPending ? "Restaurando..." : "Confirmar Restauración"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
} 