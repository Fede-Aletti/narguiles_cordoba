import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Product, ProductMedia } from "@/interfaces/product";
import { Category } from "@/interfaces/category";
import { Brand } from "@/interfaces/brand";
import { Media } from "@/interfaces/media";
import { ProductStatus } from "@/interfaces/enums";
import { getProductFavoriteCount, fetchUserFavoriteProductIds } from "./favorite-queries";
import { useStore } from "@/lib/store";

// Extended product interface for the shop with all relations
export interface ShopProduct extends Product {
  brand?: Brand | null;
  category?: Category | null;
  media?: Media[];
  description?: string;
  isFavorite?: boolean;
  favoriteCount?: number;
}

// Fetch all active products for the shop
export async function fetchShopProducts(): Promise<ShopProduct[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("product")
    .select("id, name, slug, description, price, stock, status, brand_id, category_id, created_at, updated_at, category_id, brand_id, price_group_id,created_by")
    .is("deleted_at", null)
    .in("status", ["in_stock", "running_low"]);

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  // Get product relations in batch queries
  // Get all brands for these products
  const brandIds = data.map((p) => p.brand_id).filter(id => id != null) as number[];
  let brands: Brand[] = [];

  if (brandIds.length > 0) {
    const { data: brandsData } = await supabase
      .from("brand")
      .select("*")
      .in("id", brandIds);

    brands = brandsData || [];
  }

  // Get all categories for these products
  const categoryIds = data.map((p) => p.category_id).filter(id => id != null) as number[];
  let categories: Category[] = [];

  if (categoryIds.length > 0) {
    const { data: categoriesData } = await supabase
      .from("category")
      .select("*")
      .in("id", categoryIds);

    categories = categoriesData || [];
  }

  // Get media for all products
  const productIds = data.map((p) => p.id);
  let productMediaMap: Record<number, Media[]> = {};

  if (productIds.length > 0) {
    // Get product_media entries
    const { data: productMediaData } = await supabase
      .from("product_media")
      .select("product_id, media_id")
      .in("product_id", productIds);

    if (productMediaData && productMediaData.length > 0) {
      // Get all media entries for these products
      const mediaIds = productMediaData.map((pm) => pm.media_id).filter(id => id != null) as number[];
      const { data: mediaData } = await supabase
        .from("media")
        .select("*")
        .in("id", mediaIds);

      // Create a map of product_id -> media[]
      productMediaData.forEach((pm) => {
        const media = mediaData?.find((m) => m.id === pm.media_id);
        if (media) {
          if (!productMediaMap[pm.product_id]) {
            productMediaMap[pm.product_id] = [];
          }
          productMediaMap[pm.product_id].push(media);
        }
      });
    }
  }

  // Build the final products with relations
  const shopProducts: ShopProduct[] = data.map((product) => {
    return {
      ...product,
      brand: brands.find((b) => b.id === product.brand_id) || null,
      category: categories.find((c) => c.id === product.category_id) || null,
      media: productMediaMap[product.id] || [],
    };
  });

  return shopProducts;
}

// Fetch a single product by slug with all relations AND favorite info
export async function fetchProductBySlug(
  slug: string
): Promise<ShopProduct | null> {
  const supabase = createClient();
  const { favoriteProductIds } = useStore.getState();

  const { data: product, error } = await supabase
    .from("product")
    .select("*")
    .eq("slug", slug)
    .is("deleted_at", null)
    .single();

  if (error || !product) {
    console.error(`Error fetching product by slug ${slug}:`, error);
    return null;
  }

  // Get brand
  let brand = null;
  if (product.brand_id) {
    const { data: brandData } = await supabase
      .from("brand")
      .select("*")
      .eq("id", product.brand_id)
      .is("deleted_at", null)
      .single();

    brand = brandData;
  }

  // Get category
  let category = null;
  if (product.category_id) {
    const { data: categoryData } = await supabase
      .from("category")
      .select("*")
      .eq("id", product.category_id)
      .is("deleted_at", null)
      .single();

    category = categoryData;
  }

  // Get media
  let media: Media[] = [];
  const { data: productMediaData } = await supabase
    .from("product_media")
    .select("media_id")
    .eq("product_id", product.id);

  if (productMediaData && productMediaData.length > 0) {
    const mediaIds = productMediaData.map((pm) => pm.media_id).filter(id => id != null) as number[];
    const { data: mediaData } = await supabase
      .from("media")
      .select("*")
      .in("id", mediaIds);

    media = mediaData || [];
  }

  // Obtener el conteo de favoritos para este producto
  const favoriteCount = await getProductFavoriteCount(product.id);
  
  // Determinar si es favorito para el usuario actual usando el store
  const isFavorite = favoriteProductIds.includes(product.id);

  return {
    ...product,
    brand,
    category,
    media,
    isFavorite,
    favoriteCount,
  };
}

// Fetch all categories for shop filtering
export async function fetchShopCategories(): Promise<Category[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("category")
    .select("*")
    .is("deleted_at", null);

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data || [];
}

// Fetch all brands for shop filtering
export async function fetchShopBrands(): Promise<Brand[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("brand")
    .select("*")
    .is("deleted_at", null);

  if (error) {
    console.error("Error fetching brands:", error);
    return [];
  }

  return data || [];
}

// React Query hooks
export function useShopProducts() {
  return useQuery<ShopProduct[], Error>({
    queryKey: ["shop-products"],
    queryFn: fetchShopProducts,
  });
}

export function useProductBySlug(slug: string) {
  return useQuery<ShopProduct | null, Error>({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
    enabled: !!slug,
  });
}

export function useShopCategories() {
  return useQuery<Category[], Error>({
    queryKey: ["shop-categories"],
    queryFn: fetchShopCategories,
  });
}

export function useShopBrands() {
  return useQuery<Brand[], Error>({
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
