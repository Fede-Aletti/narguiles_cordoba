"use client";
import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { EnrichedOrder } from "@/lib/queries/order-queries";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { OrderDetailView } from "./order-detail-view";

interface OrdersTableProps {
  orders: EnrichedOrder[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  console.log(orders);

  return (
    <div className="bg-gray-900 rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-gray-800/50">
            <TableHead className="text-white">Nº Pedido</TableHead>
            <TableHead className="text-white">Fecha</TableHead>
            <TableHead className="text-white">Estado</TableHead>
            <TableHead className="text-white">Total</TableHead>
            <TableHead className="text-right text-white">Detalles</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <>
              <TableRow 
                key={order.id} 
                onClick={() => toggleExpand(order.id)}
                className="cursor-pointer hover:bg-gray-800/50 border-b border-gray-800 data-[state=expanded]:bg-gray-800"
                data-state={expandedOrderId === order.id ? "expanded" : "collapsed"}
              >
                <TableCell className="font-medium text-gold-400">#{order.id.substring(0,8)}</TableCell>
                <TableCell className="text-gray-300">
                  {format(new Date(order.created_at), "dd MMM yyyy, HH:mm", { locale: es })}
                </TableCell>
                <TableCell className="text-gray-300">{order.status_display}</TableCell>
                <TableCell className="text-gray-300">${Number(order.total_amount).toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    {expandedOrderId === order.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </Button>
                </TableCell>
              </TableRow>
              {expandedOrderId === order.id && (
                <TableRow className="bg-gray-800/30 hover:bg-gray-800/50">
                  <TableCell colSpan={5} className="p-0">
                    <OrderDetailView order={order} />
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 