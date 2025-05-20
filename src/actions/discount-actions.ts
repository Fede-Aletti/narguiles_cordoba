"use server";

import { createClient } from "@/utils/supabase/server";
import type { IDiscount, IDiscountBrand, IDiscountCategory, IDiscountProduct } from "@/interfaces/discount";
import type { IBrand } from "@/interfaces/brand";
import type { ICategory } from "@/interfaces/category";
import type { IProduct } from "@/interfaces/product";

// Simplified SELECT for now, can be expanded
const DISCOUNT_SELECT_QUERY = `
  id, name, description, code, discount_type, value, 
  minimum_purchase_amount, start_date, end_date, 
  usage_limit, is_active, created_at, updated_at, deleted_at,
  brands:discount_brand(brand:brand_id(id, name)),
  categories:discount_category(category:category_id(id, name)),
  products:discount_product(product:product_id(id, name))
`;

function mapRawDiscountToIDiscount(raw: any): IDiscount {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    code: raw.code,
    discount_type: raw.discount_type, // Add type assertion if necessary
    value: raw.value,
    minimum_purchase_amount: raw.minimum_purchase_amount,
    start_date: raw.start_date,
    end_date: raw.end_date,
    usage_limit: raw.usage_limit,
    is_active: raw.is_active,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    deleted_at: raw.deleted_at,
    brands: raw.brands?.map((b: any) => b.brand).filter(Boolean) as IBrand[] | undefined,
    categories: raw.categories?.map((c: any) => c.category).filter(Boolean) as ICategory[] | undefined,
    products: raw.products?.map((p: any) => p.product).filter(Boolean) as IProduct[] | undefined,
  };
}

export async function fetchDiscounts(): Promise<IDiscount[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("discount")
    .select(DISCOUNT_SELECT_QUERY)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching discounts:", error.message);
    throw new Error(`Failed to fetch discounts: ${error.message}`);
  }
  return data ? data.map(mapRawDiscountToIDiscount) : [];
}

export type CreateDiscountPayload = Omit<IDiscount, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'brands' | 'categories' | 'products'> & {
  brand_ids?: string[];
  category_ids?: string[];
  product_ids?: string[];
};

export type UpdateDiscountPayload = Partial<CreateDiscountPayload>;

export async function createDiscount(payload: CreateDiscountPayload): Promise<IDiscount> {
  const supabase = await createClient();
  const { brand_ids, category_ids, product_ids, ...discountData } = payload;

  const { data: newDiscount, error } = await supabase
    .from("discount")
    .insert(discountData)
    .select(DISCOUNT_SELECT_QUERY) // Fetch the full discount data after insert
    .single();

  if (error) throw new Error(error.message);
  if (!newDiscount) throw new Error("Failed to create discount.");

  // Handle relations
  if (brand_ids && brand_ids.length > 0) {
    const brandRelations = brand_ids.map(brand_id => ({ discount_id: newDiscount.id, brand_id }));
    const { error: brandError } = await supabase.from('discount_brand').insert(brandRelations);
    if (brandError) console.error("Error linking brands to discount:", brandError.message); // Non-fatal for now
  }
  if (category_ids && category_ids.length > 0) {
    const categoryRelations = category_ids.map(category_id => ({ discount_id: newDiscount.id, category_id }));
    const { error: categoryError } = await supabase.from('discount_category').insert(categoryRelations);
    if (categoryError) console.error("Error linking categories to discount:", categoryError.message);
  }
  if (product_ids && product_ids.length > 0) {
    const productRelations = product_ids.map(product_id => ({ discount_id: newDiscount.id, product_id }));
    const { error: productError } = await supabase.from('discount_product').insert(productRelations);
    if (productError) console.error("Error linking products to discount:", productError.message);
  }
  
  // Re-fetch to get all populated fields accurately after linking
  const { data: populatedDiscount, error: fetchError } = await supabase
    .from('discount')
    .select(DISCOUNT_SELECT_QUERY)
    .eq('id', newDiscount.id)
    .single();

  if (fetchError) throw new Error(fetchError.message);
  if (!populatedDiscount) throw new Error("Failed to fetch populated discount after creation.");

  return mapRawDiscountToIDiscount(populatedDiscount);
}

export async function updateDiscount(id: string, payload: UpdateDiscountPayload): Promise<IDiscount> {
  const supabase = await createClient();
  const { brand_ids, category_ids, product_ids, ...discountData } = payload;

  const { data: updatedDiscount, error } = await supabase
    .from("discount")
    .update({ ...discountData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(DISCOUNT_SELECT_QUERY) // Fetch after update
    .single();

  if (error) throw new Error(error.message);
  if (!updatedDiscount) throw new Error("Discount not found or failed to update.");

  // Clear existing relations and add new ones
  // This is a simple way; more complex logic might be needed for partial updates to relations
  await supabase.from('discount_brand').delete().eq('discount_id', id);
  await supabase.from('discount_category').delete().eq('discount_id', id);
  await supabase.from('discount_product').delete().eq('discount_id', id);

  if (brand_ids && brand_ids.length > 0) {
    const brandRelations = brand_ids.map(brand_id => ({ discount_id: id, brand_id }));
    await supabase.from('discount_brand').insert(brandRelations);
  }
  if (category_ids && category_ids.length > 0) {
    const categoryRelations = category_ids.map(category_id => ({ discount_id: id, category_id }));
    await supabase.from('discount_category').insert(categoryRelations);
  }
  if (product_ids && product_ids.length > 0) {
    const productRelations = product_ids.map(product_id => ({ discount_id: id, product_id }));
    await supabase.from('discount_product').insert(productRelations);
  }

  // Re-fetch to get all populated fields accurately after linking
  const { data: populatedDiscount, error: fetchError } = await supabase
    .from('discount')
    .select(DISCOUNT_SELECT_QUERY)
    .eq('id', id)
    .single();
  
  if (fetchError) throw new Error(fetchError.message);
  if (!populatedDiscount) throw new Error("Failed to fetch populated discount after update.");

  return mapRawDiscountToIDiscount(populatedDiscount);
}

export async function deleteDiscount(id: string): Promise<{ id: string }> {
  const supabase = await createClient();
  // Perform soft delete or hard delete based on preference. Database schema has deleted_at.
  const { error } = await supabase
    .from("discount")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  
  if (error) throw new Error(error.message);
  return { id };
}

export async function restoreDiscount(id: string): Promise<IDiscount> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("discount")
    .update({ deleted_at: null, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(DISCOUNT_SELECT_QUERY)
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Discount not found or failed to restore.");
  return mapRawDiscountToIDiscount(data);
} 