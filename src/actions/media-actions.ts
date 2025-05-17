// src/app/admin/media/media-queries.ts
import { createClient } from "@/utils/supabase/client";
import type { Media } from "@/interfaces/media";

export async function fetchMedia(): Promise<Media[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("media")
    .select("id, url, alt, created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createMedia({ url, alt }: { url: string; alt?: string }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("media")
    .insert({ url, alt })
    .select("id, url, alt, created_at")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateMedia({
  id,
  url,
  alt,
}: {
  id: number;
  url: string;
  alt?: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("media")
    .update({ url, alt })
    .eq("id", id)
    .select("id, url, alt, created_at")
    .single();
  if (error) throw new Error(error.message);
  return data;
}
