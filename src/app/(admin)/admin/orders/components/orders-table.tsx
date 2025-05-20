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
  ExpandedState,
  getExpandedRowModel,
} from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { IOrder, IOrderItem } from "@/interfaces/order";
import { OrderStatus, ORDER_STATUS_VALUES } from "@/interfaces/enums";
import { ChevronDown, ChevronRight, Edit } from 'lucide-react';
// TODO: Import actions for updating order status when created
// import { updateOrderStatusAction } from "@/actions/order-actions";

interface OrdersTableProps {
  initialOrders: IOrder[];
}

// Helper to get badge variant based on status
const getOrderStatusBadgeVariant = (status: OrderStatus): 'default' | 'secondary' | 'destructive' | 'outline' | null | undefined => {
  switch (status) {
    case OrderStatus.PLACED:
    case OrderStatus.IN_CART: 
      return "secondary";
    case OrderStatus.CONFIRMED:
      return "default";
    case OrderStatus.PROCESSED:
      return "default"; // Mapped to default, consider custom styling if needed
    case OrderStatus.PICKUP:
      return "secondary"; // Mapped to secondary, consider custom styling if needed
    case OrderStatus.DELIVERED:
      return "default"; // Mapped to default (or could be a success-like custom style)
    default:
      return "outline";
  }
};

// Helper to format currency
const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
};

export function OrdersTable({ initialOrders }: OrdersTableProps) {
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [globalFilter, setGlobalFilter] = useState('');

  // TODO: Mutation for updating order status
  /*
  const updateStatusMutation = useMutation({
    mutationFn: updateOrderStatusAction, // Assuming this action takes { orderId: string, status: OrderStatus }
    onSuccess: () => {
      toast.success("Estado de la orden actualizado.");
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: any) => {
      toast.error(`Error al actualizar estado: ${error.message}`);
    }
  });
  */

  const columns: ColumnDef<IOrder>[] = useMemo(() => [
    {
      id: 'expander',
      header: () => null,
      cell: ({ row }) => (
        row.getCanExpand() ? (
          <Button variant="ghost" size="icon" onClick={row.getToggleExpandedHandler()} aria-label={row.getIsExpanded() ? "Colapsar fila" : "Expandir fila"}>
            {row.getIsExpanded() ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        ) : null
      ),
    },
    { accessorKey: "id", header: "ID Orden", cell: ({row}) => <div className="truncate w-28" title={row.original.id}>{row.original.id}</div> },
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
        <Badge variant={getOrderStatusBadgeVariant(row.original.status)} className="capitalize">
          {row.original.status.replace('_', ' ')}
        </Badge>
      ),
      // TODO: Add filter for status
    },
    { 
      accessorKey: "total_amount", 
      header: "Total", 
      cell: ({row}) => formatCurrency(row.original.total_amount) 
    },
    {
      accessorKey: "total_items",
      header: "Items",
    },
    {
      accessorKey: "created_at",
      header: "Fecha Creación",
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    },
    {
      id: 'actions',
      header: "Acciones",
      cell: ({ row }) => (
        <Button variant="outline" size="sm" onClick={() => console.log('Edit order', row.original.id)} aria-label="Editar orden">
          <Edit className="h-4 w-4 mr-1" /> Ver/Editar
        </Button>
        // TODO: Add dropdown for changing status
      ),
    },
  ], []);

  const table = useReactTable({
    data: initialOrders,
    columns,
    state: {
      sorting,
      columnFilters,
      expanded,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onExpandedChange: setExpanded,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true, // Allow all rows to expand
  });

  const renderSubComponent = ({ row }: { row: any /* Row<IOrder> */ }) => {
    const order = row.original as IOrder;
    return (
      <div className="p-4 bg-gray-100 dark:bg-gray-800">
        <h5 className="font-semibold mb-2">Detalle de la Orden:</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div><strong>ID Orden:</strong> {order.id}</div>
            <div><strong>Cliente:</strong> {order.user?.first_name} {order.user?.last_name} ({order.user?.email || 'N/A'})</div>
            <div><strong>Estado:</strong> {order.status}</div>
            <div><strong>Total:</strong> {formatCurrency(order.total_amount)} ({order.total_items} items)</div>
            <div><strong>Fecha:</strong> {new Date(order.created_at).toLocaleString()}</div>
            <div><strong>Recoge en tienda:</strong> {order.store_pickup ? 'Sí' : 'No'}</div>
        </div>
        {order.shipping_address && (
            <div className="mb-3">
                <strong>Dirección de envío:</strong> 
                {order.shipping_address.street} {order.shipping_address.street_number}, 
                {order.shipping_address.city}, {order.shipping_address.province} 
                ({order.shipping_address.postal_code})
            </div>
        )}
        <h6 className="font-medium mt-3 mb-1">Items:</h6>
        {order.order_items && order.order_items.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1">
            {order.order_items.map(item => (
              <li key={item.id}>
                {item.quantity} x {item.product?.name || 'Producto no disponible'} @ {formatCurrency(item.price_at_purchase)}
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay items en esta orden.</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar orden... (ID, cliente, email)"
        value={globalFilter ?? ''}
        onChange={(event) => setGlobalFilter(event.target.value)}
        className="max-w-sm"
      />
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
                <React.Fragment key={row.id}>
                  <TableRow data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableRow>
                      <TableCell colSpan={row.getVisibleCells().length}>
                        {renderSubComponent({ row })}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No se encontraron órdenes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* TODO: Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
} 