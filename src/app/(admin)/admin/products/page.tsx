import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server"; // Para proteger la página en el servidor
import { ProductsDataTable } from "./data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { ProductSheet } from "./product-sheet";
import { fetchProducts as fetchProductsAction } from "@/actions/product-actions"; // Renamed to avoid conflict if a client-side fetchProducts is used later
import type { IProduct } from "@/interfaces/product"; // Import IProduct
import type { ColumnDef } from "@tanstack/react-table"; // Import ColumnDef

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData?.user) {
    redirect("/login"); // O a tu página de inicio de sesión
  }

  // Verificación de rol
  const { data: userProfile } = await supabase
    .from("user")
    .select("role")
    .eq("auth_user_id", authData.user.id)
    .single();

  if (userProfile?.role !== "admin" && userProfile?.role !== "superadmin") {
    redirect("/unauthorized"); // O alguna página de "acceso denegado"
  }

  const initialProducts: IProduct[] = await fetchProductsAction();

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Productos</h1>
        <ProductSheet
          triggerButton={
            <Button aria-label="Crear nuevo producto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Producto
            </Button>
          }
        />
      </div>
      <ProductsDataTable
        columns={columns as ColumnDef<IProduct, unknown>[]}
        initialData={initialProducts}
      />
    </div>
  );
}
