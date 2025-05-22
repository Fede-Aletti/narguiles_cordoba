import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { IOrder } from "@/interfaces/order";
import { OrdersTable } from "./components/orders-table";
import { OrderRevenueChart } from "./components/order-revenue-chart";
import { OrderCountChart } from "./components/order-count-chart";
import { OrderStatusChart } from "./components/order-status-chart";
import { TopProductsChart } from "./components/top-products-chart";
import { OrderStatsCard } from "./components/order-stats-card";
import {
  getDailyOrderStats,
  getOrderStats,
  getOrderStatusDistribution,
  getTopSellingProducts,
  type OrderStats
} from "./utils/order-analytics";
import { ORDER_STATUS_VALUES, OrderStatus } from "@/interfaces/enums";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Format currency for display
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(value);
};

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData?.user) {
    redirect("/login");
  }

  // Optional: Role check (superadmin/admin/marketing might view orders)
  const { data: userProfile } = await supabase
    .from("user")
    .select("role")
    .eq("auth_user_id", authData.user.id)
    .single();

  if (!userProfile || !["superadmin", "admin", "marketing"].includes(userProfile.role)) {
    redirect("/unauthorized");
  }

  // Fetch order statistics for the last 30 days
  const currentPeriodStats = await getOrderStats(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    new Date()
  );

  // Fetch order statistics for the previous 30 days for comparison
  const previousPeriodStats = await getOrderStats(
    new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );

  // Fetch daily order stats for the charts
  const dailyOrderStats = await getDailyOrderStats(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    new Date()
  );

  // Fetch order status distribution
  const orderStatusDistribution = await getOrderStatusDistribution();

  // Fetch top selling products
  const topSellingProducts = await getTopSellingProducts(5);
  
  // Usar una consulta SQL directa para obtener el recuento de órdenes por estado
  const { data: ordersByStatus, error: ordersByStatusError } = await supabase
    .rpc('get_orders_by_status_count');

  // Si la función RPC no existe, creamos una función de reserva
  const statusCounts: Record<string, number> = {};

  if (ordersByStatusError) {
    console.error('Error al obtener recuento de órdenes por estado:', ordersByStatusError);
    
    // Consulta simple para obtener todas las órdenes no eliminadas
    const { data: allOrders } = await supabase
      .from("order")
      .select('id, status')
      .is("deleted_at", null);
      
    // Contar manualmente
    if (allOrders) {
      for (const order of allOrders) {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      }
    }
  } else if (ordersByStatus) {
    // Si la función RPC funciona, usamos los datos directamente
    for (const item of ordersByStatus) {
      statusCounts[item.status] = parseInt(item.count);
    }
  }

  // Format currency values before passing to client components
  const formattedRevenueValue = formatCurrency(currentPeriodStats.total_revenue);
  const formattedAverageValue = formatCurrency(currentPeriodStats.average_order_value);

  // Mapeo de estados a nombres en español
  const statusLabels: Record<OrderStatus, string> = {
    [OrderStatus.IN_CART]: "En Carrito",
    [OrderStatus.PLACED]: "Por Confirmar",
    [OrderStatus.CONFIRMED]: "Confirmadas",
    [OrderStatus.PROCESSED]: "Procesando",
    [OrderStatus.PICKUP]: "Para Retiro",
    [OrderStatus.SHIPPED]: "Enviadas",
    [OrderStatus.DELIVERED]: "Entregadas"
  };
  
  // Actualizar el mapeo de estados a colores con mejor contraste
  const statusColors: Record<OrderStatus, { bg: string, text: string, shadow: string, icon: string }> = {
    [OrderStatus.IN_CART]: { 
      bg: "bg-slate-200", 
      text: "text-slate-900",
      shadow: "shadow-slate-400/20",
      icon: "🛒"
    },
    [OrderStatus.PLACED]: { 
      bg: "bg-blue-200", 
      text: "text-blue-900",
      shadow: "shadow-blue-400/20",
      icon: "📝"
    },
    [OrderStatus.CONFIRMED]: { 
      bg: "bg-amber-200", 
      text: "text-amber-900",
      shadow: "shadow-amber-400/20",
      icon: "✅"
    },
    [OrderStatus.PROCESSED]: { 
      bg: "bg-purple-200", 
      text: "text-purple-900",
      shadow: "shadow-purple-400/20",
      icon: "⚙️"
    },
    [OrderStatus.PICKUP]: { 
      bg: "bg-yellow-200", 
      text: "text-yellow-900",
      shadow: "shadow-yellow-400/20",
      icon: "🏪"
    },
    [OrderStatus.SHIPPED]: { 
      bg: "bg-indigo-200", 
      text: "text-indigo-900",
      shadow: "shadow-indigo-400/20",
      icon: "🚚"
    },
    [OrderStatus.DELIVERED]: { 
      bg: "bg-green-200", 
      text: "text-green-900",
      shadow: "shadow-green-400/20",
      icon: "📦"
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Órdenes</h1>
        {/* TODO: Add any primary action button if needed, e.g., export orders */}
      </div>
      
      {/* Order Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <OrderStatsCard
          stats={currentPeriodStats}
          title="Total de Órdenes"
          description="Últimos 30 días"
          metric="total_orders"
          previousValue={previousPeriodStats.total_orders}
          icon="orders"
        />
        <OrderStatsCard
          stats={currentPeriodStats}
          title="Ingresos Totales"
          description="Últimos 30 días"
          metric="total_revenue"
          previousValue={previousPeriodStats.total_revenue}
          formattedValue={formattedRevenueValue}
          icon="revenue"
        />
        <OrderStatsCard
          stats={currentPeriodStats}
          title="Productos Vendidos"
          description="Unidades totales"
          metric="total_items_sold"
          previousValue={previousPeriodStats.total_items_sold}
          icon="items"
        />
        <OrderStatsCard
          stats={currentPeriodStats}
          title="Valor Promedio"
          description="Por orden"
          metric="average_order_value"
          previousValue={previousPeriodStats.average_order_value}
          formattedValue={formattedAverageValue}
          icon="average"
        />
      </div>
      
      {/* Orders Table */}
      <OrdersTable />
      
      {/* Order Charts */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Métricas de Órdenes</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <OrderRevenueChart data={dailyOrderStats} />
          <OrderCountChart data={dailyOrderStats} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OrderStatusChart data={orderStatusDistribution} />
          <TopProductsChart data={topSellingProducts} />
        </div>
      </div>
    </div>
  );
} 