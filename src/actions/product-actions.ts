'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import type { IProduct, IProductMedia } from '@/interfaces/product'
import type { IMediaItem } from '@/interfaces/media'
import type { IBrand } from '@/interfaces/brand'
import type { ICategory } from '@/interfaces/category'
import type { IPriceGroup } from '@/interfaces/price-group'
import { ProductStatus } from '@/interfaces/enums'

// Helper to generate slug
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
}

export interface ProductFormData {
  name: string;
  slug?: string;
  description?: string | null;
  stock: number | string;
  price?: number | string | null;
  price_group_id?: string | null;
  brand_id: string | null;
  category_id: string | null;
  status: ProductStatus;
  selectedMediaIds?: string[]; 
}

const MEDIA_ITEM_FIELDS_FOR_PRODUCT = 'id, url, name, alt_text, tags, folder_id, created_by, created_at';
const PRODUCT_SELECT_QUERY = `id, name, slug, description, stock, price, status, created_at, updated_at, deleted_at, price_group:price_group_id(*), brand:brand_id(*), category:category_id(*), product_media:product_media(id, media:media_id(${MEDIA_ITEM_FIELDS_FOR_PRODUCT}))`;

function mapRawProductToIProduct(rawProduct: any): IProduct {
  return {
    ...rawProduct,
    price_group: rawProduct.price_group as IPriceGroup | null,
    brand: rawProduct.brand as IBrand | null,
    category: rawProduct.category as ICategory | null,
    product_media: rawProduct.product_media?.map((pm: any) => ({
      id: pm.id,
      media_id: pm.media.id,
      product_id: rawProduct.id, 
      media: pm.media as IMediaItem | null,
    })) as IProductMedia[] | null,
    images: rawProduct.product_media?.map((pm: any) => pm.media as IMediaItem).filter(Boolean) as IMediaItem[] | null,
  };
}

// Fetch all active products
export async function fetchProducts(): Promise<IProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('product')
    .select(PRODUCT_SELECT_QUERY)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data?.map(mapRawProductToIProduct) as IProduct[]) ?? [];
}

// Fetch a single product by ID
export async function fetchProductById(id: string): Promise<IProduct | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('product')
    .select(PRODUCT_SELECT_QUERY)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapRawProductToIProduct(data) as IProduct;
}

export async function createProductAction(formData: ProductFormData): Promise<{ success: boolean; message: string; product: IProduct }> {
  const supabase = await createClient();
  
  const productPayload = {
    name: formData.name,
    slug: formData.slug || slugify(formData.name),
    description: formData.description || null,
    stock: Number(formData.stock),
    price: formData.price ? Number(formData.price) : null,
    price_group_id: formData.price_group_id === "null" ? null : formData.price_group_id,
    brand_id: formData.brand_id === "null" ? null : formData.brand_id,
    category_id: formData.category_id === "null" ? null : formData.category_id,
    status: formData.status,
  };
  
  const { data: product, error } = await supabase
    .from('product')
    .insert(productPayload)
    .select(PRODUCT_SELECT_QUERY) 
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }

  if (formData.selectedMediaIds && formData.selectedMediaIds.length > 0) {
    const mediaEntries = formData.selectedMediaIds.map(mediaId => ({
      product_id: product.id,
      media_id: mediaId,
    }));

    const { error: mediaError } = await supabase
      .from('product_media')
      .insert(mediaEntries);

    if (mediaError) {
      console.error('Error creating product_media entries:', mediaError);
      // Optionally, roll back product creation or handle more gracefully
      throw mediaError;
    }
  }

  revalidatePath('/admin/products');
  // Refetch product with populated fields for return
  const newProduct = await fetchProductById(product.id);
  if (!newProduct) throw new Error('Failed to fetch newly created product with populated fields');
  return { success: true, message: 'Producto creado exitosamente', product: newProduct };
}

export async function updateProductAction(productId: string, formData: ProductFormData): Promise<{ success: boolean; message: string; product: IProduct }> {
  if (!productId) throw new Error('ID de producto no encontrado');
  
  const supabase = await createClient();
  
  const productPayload = {
    name: formData.name,
    slug: formData.slug || slugify(formData.name),
    description: formData.description || null,
    stock: Number(formData.stock),
    price: formData.price ? Number(formData.price) : null,
    price_group_id: formData.price_group_id === "null" ? null : formData.price_group_id,
    brand_id: formData.brand_id === "null" ? null : formData.brand_id,
    category_id: formData.category_id === "null" ? null : formData.category_id,
    status: formData.status,
    updated_at: new Date().toISOString(),
  };

  const { data: updatedProductData, error } = await supabase
    .from('product')
    .update(productPayload)
    .eq('id', productId)
    .select('id') // Just need the ID to confirm update and refetch
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }
  if (!updatedProductData) throw new Error('Product not found or failed to update.');

  // Manage Product Media: Delete existing then add new ones
  const { error: deleteMediaError } = await supabase
    .from('product_media')
    .delete()
    .eq('product_id', productId);

  if (deleteMediaError) {
    console.error('Error deleting old product_media entries:', deleteMediaError);
    throw deleteMediaError;
  }

  if (formData.selectedMediaIds && formData.selectedMediaIds.length > 0) {
    const mediaEntries = formData.selectedMediaIds.map(mediaId => ({
      product_id: productId,
      media_id: mediaId,
    }));

    const { error: insertMediaError } = await supabase
      .from('product_media')
      .insert(mediaEntries);

    if (insertMediaError) {
      console.error('Error inserting new product_media entries:', insertMediaError);
      throw insertMediaError;
    }
  }

  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${productId}/edit`);
  // Refetch product with populated fields for return
  const finalProduct = await fetchProductById(productId);
  if (!finalProduct) throw new Error('Failed to fetch updated product with populated fields');
  return { success: true, message: 'Producto actualizado exitosamente', product: finalProduct };
}

// Soft delete a product
export async function deleteProduct(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('product')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/products');
}

// Restore a soft-deleted product
export async function restoreProduct(id: string): Promise<IProduct> {
  const supabase = await createClient();
  await supabase
    .from('product')
    .update({ deleted_at: null })
    .eq('id', id);
  
  const restoredProduct = await fetchProductById(id);
  if (!restoredProduct) throw new Error('Failed to fetch restored product.');
  revalidatePath('/admin/products');
  return restoredProduct;
} 