import { createClient } from '@/utils/supabase/client' // Cliente para el lado del cliente
import type { IProduct, IProductMedia } from '@/interfaces/product'
import type { ICategory } from '@/interfaces/category'
import type { IBrand } from '@/interfaces/brand'
import type { IPriceGroup } from '@/interfaces/price-group'
import type { IMediaItem } from '@/interfaces/media'
import { useQuery } from '@tanstack/react-query'

// Consistent select query for products, similar to product-actions
const FULL_PRODUCT_SELECT_QUERY = 
  'id, name, slug, description, stock, price, status, created_at, updated_at, deleted_at, ' +
  'price_group:price_group_id(*), ' +
  'brand:brand_id(*, image:image_id(*)), ' +
  'category:category_id(*, image:image_id(*)), ' +
  'product_media:product_media(id, media:media_id(*))';

// Simplified mapping function, assuming data structure from FULL_PRODUCT_SELECT_QUERY
function mapRawToFullIProduct(raw: any): IProduct {
  const productMedia: IProductMedia[] | null = raw.product_media?.map((pm: any) => ({
    id: pm.id as string,
    product_id: raw.id as string,
    media_id: pm.media?.id as string,
    media: pm.media as IMediaItem | null,
  })) || null;

  const images: IMediaItem[] | null = productMedia?.map(pm => pm.media).filter(Boolean) as IMediaItem[] || null;
  
  return {
    ...raw,
    price_group: raw.price_group as IPriceGroup | null,
    brand: raw.brand as IBrand | null,
    category: raw.category as ICategory | null,
    product_media: productMedia,
    images: images,
  } as IProduct;
}

export async function fetchFullProducts(): Promise<IProduct[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('product')
    .select(FULL_PRODUCT_SELECT_QUERY)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data ? data.map(mapRawToFullIProduct) : []
}

export function useFullProducts() {
    return useQuery<IProduct[], Error>({
        queryKey: ['full-products'],
        queryFn: fetchFullProducts,
    });
}

// Types for Select options
export type CategorySelectOption = Pick<ICategory, 'id' | 'name'>;
export type BrandSelectOption = Pick<IBrand, 'id' | 'name'>;
export type PriceGroupSelectOption = Pick<IPriceGroup, 'id' | 'name' | 'price'>;

export async function fetchCategoriesForSelect(): Promise<CategorySelectOption[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('category')
    .select('id, name')
    .is('deleted_at', null)
    .order('name', { ascending: true })
  if (error) throw new Error(error.message)
  return data as CategorySelectOption[] || []
}

export async function fetchBrandsForSelect(): Promise<BrandSelectOption[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('brand')
    .select('id, name')
    .is('deleted_at', null)
    .order('name', { ascending: true })
  if (error) throw new Error(error.message)
  return data as BrandSelectOption[] || []
}

export async function fetchPriceGroupsForSelect(): Promise<PriceGroupSelectOption[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('price_group')
    .select('id, name, price')
    .is('deleted_at', null)
    .order('name', { ascending: true })
  if (error) throw new Error(error.message)
  return data as PriceGroupSelectOption[] || []
}

// React Query hooks for select data
export function useCategoriesForSelect() {
    return useQuery<CategorySelectOption[], Error>({
        queryKey: ['categories-for-select'],
        queryFn: fetchCategoriesForSelect,
    });
}
export function useBrandsForSelect() {
    return useQuery<BrandSelectOption[], Error>({
        queryKey: ['brands-for-select'],
        queryFn: fetchBrandsForSelect,
    });
}
export function usePriceGroupsForSelect() {
    return useQuery<PriceGroupSelectOption[], Error>({
        queryKey: ['price-groups-for-select'],
        queryFn: fetchPriceGroupsForSelect,
    });
}

// Type for Product Select options
export type ProductSelectOption = Pick<IProduct, 'id' | 'name'>;

export async function fetchProductsForSelect(): Promise<ProductSelectOption[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('product')
    .select('id, name')
    .is('deleted_at', null)
    .order('name', { ascending: true })
  if (error) throw new Error(error.message)
  return data as ProductSelectOption[] || []
}

export function useProductsForSelect() {
    return useQuery<ProductSelectOption[], Error>({
        queryKey: ['products-for-select'],
        queryFn: fetchProductsForSelect,
    });
}

export const useProductMediaItems = (productId?: string | null) => {
  return useQuery<IMediaItem[], Error>({
    queryKey: ['product-media-items', productId],
    queryFn: async () => {
      if (!productId) return [];
      const supabase = createClient();
      
      // Explicitly type the expected shape of each item in the 'data' array
      type ProductMediaJoin = { media: IMediaItem | null };

      const { data, error } = await supabase
        .from('product_media')
        .select('media:media_id(*)') 
        .eq('product_id', productId)
        .returns<ProductMediaJoin[]>(); // Tell Supabase client what type to expect
      
      if (error) throw error;
      if (!data) return [];

      const mediaItems: IMediaItem[] = data
        .map(item => item.media) 
        .filter((mediaItem): mediaItem is IMediaItem => mediaItem !== null);

      return mediaItems;
    },
    enabled: !!productId,
  });
}; 