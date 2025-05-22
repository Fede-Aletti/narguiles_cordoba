import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { IOrder } from "@/interfaces/order";
import { OrdersTable } from "./components/orders-table";

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

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Órdenes</h1>
        {/* TODO: Add any primary action button if needed, e.g., export orders */}
      </div>
      <OrdersTable />
      
      {/* TODO: Section for charts and metrics */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Métricas de Órdenes</h2>
        {/* Placeholder for charts - e.g., using Recharts or a Shadcn chart component if available */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2">Total de Órdenes (Últimos 30 días)</h3>
            <p className="text-3xl font-bold">{/* Metric here */}</p>
            {/* Chart placeholder */}
            <div className="h-64 bg-muted/50 mt-4 rounded flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Gráfico de ejemplo</p>
            </div>
          </div>
          <div className="p-6 border rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2">Ingresos Totales (Últimos 30 días)</h3>
            <p className="text-3xl font-bold">{/* Metric here */}</p>
            {/* Chart placeholder */}
            <div className="h-64 bg-muted/50 mt-4 rounded flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Gráfico de ejemplo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 