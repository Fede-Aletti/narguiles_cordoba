// src/app/admin/price-groups/price-group-queries.ts
import { createClient } from '@/utils/supabase/server'; // Assuming server for actions
import type { IPriceGroup } from '@/interfaces/price-group';

// Fetch all active price groups
export async function fetchPriceGroups(): Promise<IPriceGroup[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('price_group')
    .select('*') // Fetch all columns, created_by_user can be populated if RLS allows/needed
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data as IPriceGroup[] ?? [];
}

// Fetch a single price group by ID
export async function fetchPriceGroupById(id: string): Promise<IPriceGroup | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('price_group')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as IPriceGroup | null;
}

interface CreatePriceGroupPayload {
  name: string;
  price: number;
  // created_by will be set by RLS/database based on authenticated user
}

// Create a new price group
export async function createPriceGroup(payload: CreatePriceGroupPayload): Promise<IPriceGroup> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('price_group')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as IPriceGroup;
}

interface UpdatePriceGroupPayload {
  name?: string;
  price?: number;
}

// Update an existing price group
export async function updatePriceGroup(id: string, payload: UpdatePriceGroupPayload): Promise<IPriceGroup> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('price_group')
    .update(payload)
    .eq('id', id)
    .is('deleted_at', null)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as IPriceGroup;
}

// Soft delete a price group
export async function deletePriceGroup(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('price_group')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

// Restore a soft-deleted price group
export async function restorePriceGroup(id: string): Promise<IPriceGroup> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('price_group')
    .update({ deleted_at: null })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as IPriceGroup;
}
