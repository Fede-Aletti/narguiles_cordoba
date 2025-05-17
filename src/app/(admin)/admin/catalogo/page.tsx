// src/app/admin/catalogo/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { CategoryTable } from "./category-table";
import { BrandTable } from "./brand-table";

export default async function CatalogoPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-10 space-y-10">
      <h1 className="text-3xl font-bold mb-8">Catálogo: Categorías y Marcas</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <CategoryTable />
        <BrandTable />
      </div>
    </div>
  );
}
