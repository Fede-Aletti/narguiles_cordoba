// src/app/admin/catalogo/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { CategoryTable } from "./components/category-table";
import { BrandTable } from "./components/brand-table";
import { fetchCategories } from "@/actions/category-actions";
import { fetchBrands } from "@/actions/brand-actions";
import type { ICategory } from "@/interfaces/category";
import type { IBrand } from "@/interfaces/brand";

export default async function CatalogoPage() {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData?.user) {
    redirect("/login");
  }

  let initialCategories: ICategory[] = [];
  let initialBrands: IBrand[] = [];
  let categoriesError: string | null = null;
  let brandsError: string | null = null;

  try {
    initialCategories = await fetchCategories();
  } catch (e: any) {
    console.error("Failed to fetch categories:", e.message);
    categoriesError = e.message;
  }

  try {
    initialBrands = await fetchBrands();
  } catch (e: any) {
    console.error("Failed to fetch brands:", e.message);
    brandsError = e.message;
  }

  return (
    <div className="container mx-auto py-10 space-y-10">
      <h1 className="text-3xl font-bold mb-8">Catálogo: Categorías y Marcas</h1>
      {/* TODO: Display errors to user if categoriesError or brandsError are not null */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <CategoryTable initialCategories={initialCategories} />
        <BrandTable initialBrands={initialBrands} />
      </div>
    </div>
  );
}
