// src/app/admin/price-groups/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { PriceGroupTable } from "./components/data-table";
import { fetchPriceGroups } from "@/actions/price-group-actions";
import type { IPriceGroup } from "@/interfaces/price-group";

export default async function PriceGroupsPage() {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData?.user) {
    redirect("/login");
  }

  let initialPriceGroups: IPriceGroup[] = [];
  let errorLoadingPriceGroups: string | null = null;

  try {
    initialPriceGroups = await fetchPriceGroups();
  } catch (e: any) {
    console.error("Failed to fetch price groups:", e.message);
    errorLoadingPriceGroups = e.message;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Gestión de Grupos de Precios</h1>
      <PriceGroupTable initialPriceGroups={initialPriceGroups} />
    </div>
  );
}