import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { fetchDiscounts } from "@/actions/discount-actions";
import type { IDiscount } from "@/interfaces/discount";
import { DiscountsTable } from "./components/discounts-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
// Import DiscountFormSheet or a similar modal trigger for creating discounts
// For now, we'll assume a Dialog will be used within DiscountsTable or a separate sheet component

export default async function AdminDiscountsPage() {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData?.user) {
    redirect("/login");
  }

  const { data: userProfile } = await supabase
    .from("user")
    .select("role")
    .eq("auth_user_id", authData.user.id)
    .single();

  if (!userProfile || !["superadmin", "admin", "marketing"].includes(userProfile.role)) {
    redirect("/unauthorized");
  }

  let initialDiscounts: IDiscount[] = [];
  let errorLoadingDiscounts: string | null = null;

  try {
    initialDiscounts = await fetchDiscounts();
  } catch (e: any) {
    console.error("Failed to fetch discounts:", e.message);
    errorLoadingDiscounts = e.message;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Descuentos</h1>
        {/* Trigger for creating a new discount will be part of DiscountsTable or its own Sheet */}
      </div>
      {errorLoadingDiscounts && (
        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
          <span className="font-medium">Error:</span> {errorLoadingDiscounts}
        </div>
      )}
      <DiscountsTable initialDiscounts={initialDiscounts} />
    </div>
  );
} 