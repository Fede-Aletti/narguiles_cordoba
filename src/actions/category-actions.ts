// src/app/admin/catalogo/category-queries.ts
import { createClient } from "@/utils/supabase/client";
import type { Category } from "@/interfaces/category";

export async function fetchCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("category")
    .select("id, name, created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createCategory({ name }: { name: string }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("category")
    .insert({ name })
    .select("id, name, created_at")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateCategory({
  id,
  name,
}: {
  id: number;
  name: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("category")
    .update({ name })
    .eq("id", id)
    .select("id, name, created_at")
    .single();
  if (error) throw new Error(error.message);
  return data;
}
