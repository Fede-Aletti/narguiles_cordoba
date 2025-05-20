"use server";
import { createClient } from '@/utils/supabase/server'
import type { IBrand } from '@/interfaces/brand'
import type { IMediaItem } from '@/interfaces/media'

// Fetch all active brands
export async function fetchBrands(): Promise<IBrand[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('brand')
    .select('*, image:image_id(*)') // Fetch related image
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data?.map(brand => ({
    ...brand,
    image: brand.image as IMediaItem | null
  })) as IBrand[]) ?? []
}

// Fetch a single brand by ID
export async function fetchBrandById(id: string): Promise<IBrand | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('brand')
    .select('*, image:image_id(*)')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null
  return { ...data, image: data.image as IMediaItem | null } as IBrand
}

interface CreateBrandPayload {
  name: string
  description?: string | null
  image_id?: string | null
}

// Create a new brand
export async function createBrand(payload: CreateBrandPayload): Promise<IBrand> {
  const supabase = await createClient()
  // Assuming created_by will be set by database trigger or handled by RLS
  const { data, error } = await supabase
    .from('brand')
    .insert(payload)
    .select('*, image:image_id(*)')
    .single()
  if (error) throw new Error(error.message)
  return { ...data, image: data.image as IMediaItem | null } as IBrand
}

interface UpdateBrandPayload {
  name?: string
  description?: string | null
  image_id?: string | null
}

// Update an existing brand
export async function updateBrand(id: string, payload: UpdateBrandPayload): Promise<IBrand> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('brand')
    .update(payload)
    .eq('id', id)
    .is('deleted_at', null) // Ensure we only update active brands
    .select('*, image:image_id(*)')
    .single()
  if (error) throw new Error(error.message)
  return { ...data, image: data.image as IMediaItem | null } as IBrand
}

// Soft delete a brand
export async function deleteBrand(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('brand')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

// Restore a soft-deleted brand
export async function restoreBrand(id: string): Promise<IBrand> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('brand')
    .update({ deleted_at: null })
    .eq('id', id)
    .select('*, image:image_id(*)')
    .single()
  if (error) throw new Error(error.message)
  return { ...data, image: data.image as IMediaItem | null } as IBrand
}
