// src/app/admin/price-groups/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { PriceGroupTable } from "./components/data-table";

export default async function PriceGroupsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Gestión de Grupos de Precios</h1>
      <PriceGroupTable />
    </div>
  );
}