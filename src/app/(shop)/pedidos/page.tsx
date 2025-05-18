import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag } from "lucide-react";

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.getUser();

  if (error || !authData?.user) {
    redirect("/login");
  }

  // Primero obtener el ID de usuario de la tabla 'user'
  const { data: userData, error: userError } = await supabase
    .from("user")
    .select("id")
    .eq("auth_user_id", authData.user.id)
    .single();

  if (userError || !userData) {
    return (
      <div className="container max-w-4xl mx-auto py-16 px-4 md:px-6 mt-12">
        <h1 className="text-3xl font-bold mb-8">Mis Pedidos</h1>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Error al obtener la información de tu perfil. Por favor, intenta más tarde.
          </p>
        </div>
      </div>
    );
  }

  // Obtener los pedidos del usuario
  const { data: orders, error: ordersError } = await supabase
    .from("order")
    .select("id, status, total, total_quantity, created_at")
    .eq("user_id", userData.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (ordersError) {
    console.error("Error al obtener pedidos:", ordersError);
  }

  // Helper para mostrar el badge de estado del pedido
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_cart":
        return <Badge variant="outline">En carrito</Badge>;
      case "placed":
        return <Badge variant="secondary">Pedido realizado</Badge>;
      case "confirmed":
        return <Badge variant="secondary">Confirmado</Badge>;
      case "processed":
        return <Badge variant="primary">Procesado</Badge>;
      case "pickup":
        return <Badge variant="warning">Listo para recoger</Badge>;
      case "delivered":
        return <Badge variant="success">Entregado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-16 px-4 md:px-6 mt-12">
      <h1 className="text-3xl font-bold mb-8">Mis Pedidos</h1>

      {!orders || orders.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-8 text-center">
          <div className="mb-4 flex justify-center">
            <ShoppingBag className="h-16 w-16 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No tienes pedidos aún</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Parece que aún no has realizado ningún pedido con nosotros.
          </p>
          <Button asChild>
            <Link href="/tienda">Ir a la tienda</Link>
          </Button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº de Pedido</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>
                    {format(new Date(order.created_at), "dd MMM yyyy", { locale: es })}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>${Number(order.total).toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link href={`/pedidos/${order.id}`}>Ver detalles</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 