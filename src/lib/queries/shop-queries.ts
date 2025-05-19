import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Product, ProductMedia } from "@/interfaces/product";
import { Category } from "@/interfaces/category";
import { Brand } from "@/interfaces/brand";
import { Media } from "@/interfaces/media";
import { ProductStatus } from "@/interfaces/enums";

// Extended product interface for the shop with all relations
export interface ShopProduct extends Product {
  brand?: Brand | null;
  category?: Category | null;
  media?: Media[];
  description?: string;
}

// Fetch all active products for the shop
export async function fetchShopProducts(): Promise<ShopProduct[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("product")
    .select(
      `
    id, name, slug, description, price, stock, status, brand_id, category_id,
    product_media:product_media(
      media:media_id(
        id, url, alt
      )
    )
  `
    )
    .is("deleted_at", null)
    .in("status", ["in_stock", "running_low"]);

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  // Get product relations in batch queries
  // Get all brands for these products
  const brandIds = data.filter((p) => p.brand_id).map((p) => p.brand_id);
  let brands: Brand[] = [];

  if (brandIds.length > 0) {
    const { data: brandsData } = await supabase
      .from("brand")
      .select("id, name")
      .in("id", brandIds as number[])
      .is("deleted_at", null);

    brands = brandsData || [];
  }

  // Get all categories for these products
  const categoryIds = data
    .filter((p) => p.category_id)
    .map((p) => p.category_id);
  let categories: Category[] = [];

  if (categoryIds.length > 0) {
    const { data: categoriesData } = await supabase
      .from("category")
      .select("id, name")
      .in("id", categoryIds as number[])
      .is("deleted_at", null);

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
      const mediaIds = productMediaData.map((pm) => pm.media_id);
      const { data: mediaData } = await supabase
        .from("media")
        .select("id, url, alt")
        .in("id", mediaIds)
        .is("deleted_at", null);

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

// Fetch a single product by slug with all relations
export async function fetchProductBySlug(
  slug: string
): Promise<ShopProduct | null> {
  const supabase = createClient();

  const { data: product, error } = await supabase
    .from("product")
    .select(
      `
      id, 
      name,
      slug,
      description,
      price,
      stock,
      status,
      price_group_id,
      brand_id,
      category_id,
      created_at
    `
    )
    .eq("slug", slug)
    .is("deleted_at", null)
    .single();

  if (error || !product) {
    console.error("Error fetching product:", error);
    return null;
  }

  // Get brand
  let brand = null;
  if (product.brand_id) {
    const { data: brandData } = await supabase
      .from("brand")
      .select("id, name")
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
      .select("id, name")
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
    const mediaIds = productMediaData.map((pm) => pm.media_id);
    const { data: mediaData } = await supabase
      .from("media")
      .select("id, url, alt")
      .in("id", mediaIds)
      .is("deleted_at", null);

    media = mediaData || [];
  }

  return {
    ...product,
    brand,
    category,
    media,
  };
}

// Fetch all categories for shop filtering
export async function fetchShopCategories(): Promise<Category[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("category")
    .select("id, name")
    .is("deleted_at", null);

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data;
}

// Fetch all brands for shop filtering
export async function fetchShopBrands(): Promise<Brand[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("brand")
    .select("id, name")
    .is("deleted_at", null);

  if (error) {
    console.error("Error fetching brands:", error);
    return [];
  }

  return data;
}

// React Query hooks
export function useShopProducts() {
  return useQuery({
    queryKey: ["shop-products"],
    queryFn: fetchShopProducts,
  });
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
    enabled: !!slug,
  });
}

export function useShopCategories() {
  return useQuery({
    queryKey: ["shop-categories"],
    queryFn: fetchShopCategories,
  });
}

export function useShopBrands() {
  return useQuery({
    queryKey: ["shop-brands"],
    queryFn: fetchShopBrands,
  });
}

// Add a function to check login status without failing if user doesn't exist
export async function fetchCurrentUser() {
  const supabase = createClient();

  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return null;

    const { data: user } = await supabase
      .from("user")
      .select("id, first_name, last_name, role")
      .eq("auth_user_id", session.session.user.id)
      .single();

    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

// Add this hook to your existing queries
export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: fetchCurrentUser,
    // Don't refetch on window focus to reduce unnecessary queries
    refetchOnWindowFocus: false,
  });
}
