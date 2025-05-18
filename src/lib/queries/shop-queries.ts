import { createClient } from '@/utils/supabase/client';
import { useQuery } from '@tanstack/react-query';

// Producto para la tienda con todas las relaciones necesarias
export interface ShopProduct {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number | null;
  stock: number;
  status: string;
  brand: { id: number; name: string; } | null;
  category: { id: number; name: string; } | null;
  product_media: Array<{
    media: {
      id: number;
      url: string;
      alt: string | null;
    }
  }> | null;
}

// Función para obtener todos los productos para la tienda (solo en stock)
export async function fetchShopProducts(): Promise<ShopProduct[]> {
  const supabase = createClient();
  
  // Enfoque directo sin relaciones anidadas complejas
  const { data, error } = await supabase
    .from('product')
    .select(`
      id, 
      name,
      slug,
      description,
      price,
      stock,
      status
    `)
    .is('deleted_at', null);
    
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  
  // Obtener las relaciones por separado para cada producto
  const enhancedProducts = await Promise.all(data.map(async (product) => {
    // Obtener la categoría
    const { data: category } = await supabase
      .from('category')
      .select('id, name')
      .eq('id', product.category_id)
      .single();
      
    // Obtener la marca
    const { data: brand } = await supabase
      .from('brand')
      .select('id, name')
      .eq('id', product.brand_id)
      .single();
      
    // Obtener las imágenes
    const { data: productMedia } = await supabase
      .from('product_media')
      .select(`
        id,
        media:media_id (
          id,
          url,
          alt
        )
      `)
      .eq('product_id', product.id);
    
    return {
      ...product,
      category,
      brand,
      product_media: productMedia || []
    };
  }));
  
  return enhancedProducts;
}

// Función para obtener categorías 
export async function fetchShopCategories() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('category')
    .select('id, name')
    .is('deleted_at', null);
    
  if (error) throw error;
  return data || [];
}

// Hook para obtener productos con React Query
export function useShopProducts() {
  return useQuery({
    queryKey: ['shop-products'],
    queryFn: fetchShopProducts,
  });
}

// Hook para obtener categorías
export function useShopCategories() {
  return useQuery({
    queryKey: ['shop-categories'],
    queryFn: fetchShopCategories,
  });
} 