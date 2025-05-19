"use client";
import { useUserOrdersWithDetails } from "@/lib/queries/order-queries";
import { OrdersTable } from "@/components/orders/orders-table";
import { Skeleton } from "@/components/ui/skeleton"; // Para el estado de carga

export default function PedidosPage() {
  const { data: orders, isLoading, error } = useUserOrdersWithDetails();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 pt-24 px-4 md:px-6">
        <h1 className="text-3xl font-bold text-white mb-8">Mis Pedidos</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full bg-gray-800 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 pt-24 px-4 md:px-6">
        <h1 className="text-3xl font-bold text-white mb-8">Mis Pedidos</h1>
        <div className="text-red-500">Error al cargar los pedidos: {error.message}</div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto py-8 pt-24 px-4 md:px-6">
        <h1 className="text-3xl font-bold text-white mb-8">Mis Pedidos</h1>
        <div className="text-gray-400">No tienes pedidos realizados.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto py-8 pt-24 px-4 md:px-6">
        <h1 className="text-3xl font-bold text-white mb-8">Mis Pedidos</h1>
        <OrdersTable orders={orders} />
      </div>
    </div>
  );
} 