import { createClient } from '@/utils/supabase/client' // Cliente para el lado del cliente
import type { ProductRow } from '@/types/product'
import { useQuery } from '@tanstack/react-query'

export async function fetchProducts(): Promise<ProductRow[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('product')
    .select(`
      *,
      category(id, name),
      brand(id, name),
      price_group(id, name, price),
      product_media(id, media_id, media(id, url, alt))
    `)
    .is('deleted_at', null)
    .order('id', { ascending: false })
  
  if (error) throw error
  return data || []
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

export const useProductMediaQuery = (productId?: number) => {
  return useQuery({
    queryKey: ['product-media', productId],
    queryFn: async () => {
      if (!productId) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from('product_media')
        .select('media_id, media:media_id(id, url, alt)')
        .eq('product_id', productId);
      
      if (error) throw error;
      return data?.map(item => item.media) || [];
    },
    enabled: !!productId,
  });
}; 