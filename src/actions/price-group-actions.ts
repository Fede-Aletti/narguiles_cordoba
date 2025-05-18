// src/app/admin/price-groups/price-group-queries.ts
import { createClient } from "@/utils/supabase/client";
import type { PriceGroup } from "@/interfaces/price-group";

export async function fetchPriceGroups(): Promise<PriceGroup[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("price_group")
    .select("id, name, price, created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createPriceGroup({
  name,
  price,
}: {
  name: string;
  price: number;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("price_group")
    .insert({ name, price })
    .select("id, name, price, created_at")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updatePriceGroup({
  id,
  name,
  price,
}: {
  id: number;
  name: string;
  price: number;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("price_group")
    .update({ name, price })
    .eq("id", id)
    .select("id, name, price, created_at")
    .single();
  if (error) throw new Error(error.message);
  return data;
}
