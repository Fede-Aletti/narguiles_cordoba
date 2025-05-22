"use server";
// src/app/admin/catalogo/category-queries.ts
import { createClient } from '@/utils/supabase/server'; // Assuming server for actions
import type { ICategory } from '@/interfaces/category';
import type { IMediaItem } from '@/interfaces/media';

// Fetch all active categories
export async function fetchCategories(): Promise<ICategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('category')
    .select('*, image:image_id(*)') // Fetch related image
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (
    data?.map(category => ({
      ...category,
      image: category.image as IMediaItem | null
    })) as ICategory[]
  ) ?? [];
}

// Fetch a single category by ID
export async function fetchCategoryById(id: string): Promise<ICategory | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('category')
    .select('*, image:image_id(*)')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return { ...data, image: data.image as IMediaItem | null } as ICategory;
}

interface CreateCategoryPayload {
  name: string;
  description?: string | null;
  image_id?: string | null;
}

// Create a new category
export async function createCategory(payload: CreateCategoryPayload): Promise<ICategory> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('category')
    .insert(payload)
    .select('*, image:image_id(*)')
    .single();
  if (error) throw new Error(error.message);
  return { ...data, image: data.image as IMediaItem | null } as ICategory;
}

interface UpdateCategoryPayload {
  name?: string;
  description?: string | null;
  image_id?: string | null;
}

// Update an existing category
export async function updateCategory(id: string, payload: UpdateCategoryPayload): Promise<ICategory> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('category')
    .update(payload)
    .eq('id', id)
    .is('deleted_at', null)
    .select('*, image:image_id(*)')
    .single();
  if (error) throw new Error(error.message);
  return { ...data, image: data.image as IMediaItem | null } as ICategory;
}

// Soft delete a category
export async function deleteCategory(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('category')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

// Restore a soft-deleted category
export async function restoreCategory(id: string): Promise<ICategory> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('category')
    .update({ deleted_at: null })
    .eq('id', id)
    .select('*, image:image_id(*)')
    .single();
  if (error) throw new Error(error.message);
  return { ...data, image: data.image as IMediaItem | null } as ICategory;
}
