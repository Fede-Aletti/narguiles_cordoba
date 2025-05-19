"use client";
import { useUserOrdersWithDetails } from "@/lib/queries/order-queries";
import { OrdersTable } from "@/components/orders/orders-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

export default function PedidosPage() {
  const { data: orders, isLoading: ordersLoading, error } = useUserOrdersWithDetails();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Debes iniciar sesión primero para ver tus pedidos.");
        router.push('/tienda');
      } else {
        setIsAuthenticated(true);
      }
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, [router]);

  if (isCheckingAuth || (isAuthenticated && ordersLoading)) {
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

  if (!isAuthenticated && !isCheckingAuth) {
    return (
        <div className="container mx-auto py-8 pt-24 px-4 md:px-6">
         <h1 className="text-3xl font-bold text-white mb-8">Mis Pedidos</h1>
         <p className="text-gray-400">Redirigiendo...</p>
       </div>
    );
  }

  if (isAuthenticated && error) {
    return (
      <div className="container mx-auto py-8 pt-24 px-4 md:px-6">
        <h1 className="text-3xl font-bold text-white mb-8">Mis Pedidos</h1>
        <div className="text-red-500">Error al cargar los pedidos: {error.message}</div>
      </div>
    );
  }

  if (isAuthenticated && (!orders || orders.length === 0)) {
    return (
      <div className="container mx-auto py-8 pt-24 px-4 md:px-6">
        <h1 className="text-3xl font-bold text-white mb-8">Mis Pedidos</h1>
        <div className="text-gray-400">No tienes pedidos realizados.</div>
      </div>
    );
  }
  
  if (isAuthenticated && orders && orders.length > 0) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto py-8 pt-24 px-4 md:px-6">
          <h1 className="text-3xl font-bold text-white mb-8">Mis Pedidos</h1>
          <OrdersTable orders={orders} />
        </div>
      </div>
    );
  }

  return null;
} 