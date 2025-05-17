import { createClient } from '@/utils/supabase/client'
import type { Brand } from '@/interfaces/brand'

export async function fetchBrands(): Promise<Brand[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('brand')
    .select('id, name, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createBrand({ name }: { name: string }) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('brand')
    .insert({ name })
    .select('id, name, created_at')
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateBrand({ id, name }: { id: number, name: string }) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('brand')
    .update({ name })
    .eq('id', id)
    .select('id, name, created_at')
    .single()
  if (error) throw new Error(error.message)
  return data
}
