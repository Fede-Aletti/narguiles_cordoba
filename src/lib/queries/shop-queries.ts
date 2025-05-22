import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { IProduct, IProductMedia } from "@/interfaces/product";
import type { ICategory } from "@/interfaces/category";
import type { IBrand } from "@/interfaces/brand";
import type { IMediaItem } from "@/interfaces/media";
import type { IPriceGroup } from "@/interfaces/price-group";
import { ProductStatus } from "@/interfaces/enums";
import { getProductFavoriteCount, fetchUserFavoriteProductIds } from "./favorite-queries"; // Ensure this returns string[] for IDs
import { useStore } from "@/lib/store";

// Define the fields to select from media_item specifically for shop products
const SHOP_MEDIA_ITEM_SELECT_FIELDS = 'id, url, name, alt_text, tags, folder_id, created_at'; // Excludes created_by as it might not be needed for shop display

// Extended product interface for the shop with all relations
export interface IShopProduct extends IProduct {
  // IProduct already includes:
  // brand?: IBrand | null;
  // category?: ICategory | null;
  // price_group?: IPriceGroup | null;
  // images?: IMediaItem[] | null; // Derived from product_media
  // product_media?: IProductMedia[] | null;

  isFavorite?: boolean;
  favoriteCount?: number;
}

const SHOP_PRODUCT_SELECT_QUERY = 
  'id, name, slug, description, stock, price, status, created_at, updated_at, ' +
  'price_group:price_group_id(*), ' +
  'brand:brand_id(*, image:image_id(id, url, name, alt_text)), ' +      // Populate brand and its image, be specific
  'category:category_id(*, image:image_id(id, url, name, alt_text)), ' +  // Populate category and its image, be specific
  `product_media:product_media(id, media:media_id(${SHOP_MEDIA_ITEM_SELECT_FIELDS}))`; // Populate product_media and the nested media_item with specific fields

function mapRawProductToIShopProduct(rawProduct: any, userFavoriteIds: string[] = []): IShopProduct {
  const productMedia: IProductMedia[] | null = rawProduct.product_media?.map((pm: any) => ({
    id: pm.id as string,
    product_id: rawProduct.id as string,
    media_id: pm.media?.id as string,
    media: pm.media as IMediaItem | null,
  })) || null;

  const images: IMediaItem[] | null = productMedia?.map(pm => pm.media).filter(Boolean) as IMediaItem[] || null;

  return {
    id: rawProduct.id as string,
    name: rawProduct.name as string,
    slug: rawProduct.slug as string,
    description: rawProduct.description as string | null,
    stock: rawProduct.stock as number,
    price: rawProduct.price as number | null,
    price_group_id: rawProduct.price_group_id as string | null,
    price_group: rawProduct.price_group as IPriceGroup | null,
    brand_id: rawProduct.brand_id as string | null,
    brand: rawProduct.brand as IBrand | null,
    category_id: rawProduct.category_id as string | null,
    category: rawProduct.category as ICategory | null,
    status: rawProduct.status as ProductStatus,
    product_media: productMedia,
    images: images,
    created_by: rawProduct.created_by as string | null,
    // created_by_user: rawProduct.created_by_user as IUser | null, // Not typically fetched in shop queries for performance
    created_at: rawProduct.created_at as string,
    updated_at: rawProduct.updated_at as string | null,
    deleted_at: rawProduct.deleted_at as string | null,
    isFavorite: userFavoriteIds.includes(rawProduct.id as string),
    // favoriteCount will be fetched separately or in a more complex query if needed for lists
  };
}


// Fetch all active products for the shop
export async function fetchShopProducts(): Promise<IShopProduct[]> {
  const supabase = createClient();
  const userFavoriteIds = await fetchUserFavoriteProductIds(); // Fetch once

  const { data, error } = await supabase
    .from("product")
    .select(SHOP_PRODUCT_SELECT_QUERY)
    .is("deleted_at", null)
    .in("status", [ProductStatus.IN_STOCK, ProductStatus.RUNNING_LOW])
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching shop products:", error);
    throw error; // Re-throw to be caught by react-query
  }

  const products = data ? data.map(p => mapRawProductToIShopProduct(p, userFavoriteIds)) : [];
  
  // Optionally, fetch favorite counts in a batch if necessary for display
  // For simplicity here, favoriteCount is not batch-fetched for the entire list.
  // It's better fetched on demand for a single product view (see fetchProductBySlug)
  // or if performance allows and it's critical for the list display.

  return products;
}

// Fetch a single product by slug with all relations AND favorite info
export async function fetchProductBySlug(slug: string): Promise<IShopProduct | null> {
  const supabase = createClient();
  const { data: product, error } = await supabase
    .from("product")
    .select(SHOP_PRODUCT_SELECT_QUERY)
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("Error fetching product by slug " + slug + ":", error);
    throw error; 
  }

  // Check if product is null, or if it resembles an error object
  if (!product || (typeof product === 'object' && product !== null && (product as any).error === true) || (typeof product !== 'object' && typeof (product as any)?.message === 'string' && (product as any)?.error === true) ) {
    if (product && typeof (product as any).message === 'string') {
      console.error("Received error-like object as product data: " + (product as any).message);
    } else if (!product) {
      // This is normal if slug doesn't exist, no error needed unless debugging
      // console.log(`Product with slug ${slug} not found.`);
    } else {
      console.error("Received invalid product data structure:", product);
    }
    return null;
  }

  // At this point, product should be a valid product object from the database
  // TypeScript might still be unsure, so we use a type assertion for clarity before mapping.
  const validProduct = product as unknown as IShopProduct; // Assuming it fits IShopProduct structure by now

  if (typeof validProduct.id !== 'string') {
     console.error('Product ID is not a string after checks:', validProduct);
     return null; 
  }

  const userFavoriteIds = await fetchUserFavoriteProductIds();
  const favoriteCount = await getProductFavoriteCount(validProduct.id);
  const shopProductWithFavorites = mapRawProductToIShopProduct(validProduct, userFavoriteIds);

  return {
    ...shopProductWithFavorites,
    favoriteCount,
  };
}

const CATEGORY_SELECT_QUERY = '*, image:image_id(*)'; // Include image

// Fetch all categories for shop filtering
export async function fetchShopCategories(): Promise<ICategory[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("category")
    .select(CATEGORY_SELECT_QUERY)
    .is("deleted_at", null)
    .order('name', { ascending: true });

  if (error) {
    console.error("Error fetching shop categories:", error);
    throw error;
  }
  return (data as ICategory[]) || [];
}

const BRAND_SELECT_QUERY = '*, image:image_id(*)'; // Include image

// Fetch all brands for shop filtering
export async function fetchShopBrands(): Promise<IBrand[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("brand")
    .select(BRAND_SELECT_QUERY)
    .is("deleted_at", null)
    .order('name', { ascending: true });

  if (error) {
    console.error("Error fetching shop brands:", error);
    throw error;
  }
  return (data as IBrand[]) || [];
}

// React Query hooks
export function useShopProducts() {
  return useQuery<IShopProduct[], Error>({
    queryKey: ["shop-products"],
    queryFn: fetchShopProducts,
  });
}

export function useProductBySlug(slug: string) {
  return useQuery<IShopProduct | null, Error>({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
    enabled: !!slug,
  });
}

export function useShopCategories() {
  return useQuery<ICategory[], Error>({
    queryKey: ["shop-categories"],
    queryFn: fetchShopCategories,
  });
}

export function useShopBrands() {
  return useQuery<IBrand[], Error>({
    queryKey: ["shop-brands"],
    queryFn: fetchShopBrands,
  });
}

// Add a function to check login status without failing if user doesn't exist
export async function fetchCurrentUser() {
  const supabase = createClient();
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser) {
    // console.error("Error fetching auth user or no auth user:", authError);
    return null;
  }
  const { data: userProfile, error: profileError } = await supabase
    .from("user")
    .select("*")
    .eq("auth_user_id", authUser.id)
    .single();
  if (profileError) {
    console.error("Error fetching user profile:", profileError);
    return null;
  }
  return userProfile;
}

// Add this hook to your existing queries
export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: fetchCurrentUser,
  });
}
