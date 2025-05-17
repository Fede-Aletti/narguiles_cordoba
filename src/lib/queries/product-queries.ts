import { createClient } from '@/utils/supabase/client' // Cliente para el lado del cliente
import type { ProductRow } from '@/types/product'

export async function fetchProducts(): Promise<ProductRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('product')
    .select(`
      id,
      name,
      slug,
      stock,
      price,
      status,
      category:category_id (name),
      brand:brand_id (name),
      price_group:price_group_id (name),
      created_at,
      updated_at
    `)
    .is('deleted_at', null) // Siguiendo database-handling.mdc
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    throw new Error(error.message)
  }
  
  // Asegurarse de que el tipo devuelto coincida con ProductRow
  // Supabase debería devolver los objetos anidados directamente
  return data as unknown as ProductRow[]
}

// Funciones para obtener datos para los Selects del formulario
export async function fetchCategoriesForSelect() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('category')
    .select('id, name')
    .is('deleted_at', null)
    .order('name', { ascending: true })
  if (error) throw new Error(error.message)
  return data
}

export async function fetchBrandsForSelect() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('brand')
    .select('id, name')
    .is('deleted_at', null)
    .order('name', { ascending: true })
  if (error) throw new Error(error.message)
  return data
}

export async function fetchPriceGroupsForSelect() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('price_group')
    .select('id, name, price')
    .is('deleted_at', null)
    .order('name', { ascending: true })
  if (error) throw new Error(error.message)
  return data
} 