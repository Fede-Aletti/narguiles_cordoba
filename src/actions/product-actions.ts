'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import type { ProductFormData } from '@/types/product'
import { ProductStatus } from '@/interfaces/enums' // Necesitarás este enum


// Helper para generar slug (puedes mejorarlo)
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
}

export async function createProductAction(data: ProductFormData) {
  const supabase = await createClient()
  
  const { data: product, error } = await supabase
    .from('product')
    .insert({
      name: data.name,
      slug: data.slug || slugify(data.name),
      stock: Number(data.stock),
      price: data.price || null,
      price_group_id: data.price_group_id || null,
      brand_id: Number(data.brand_id),
      category_id: Number(data.category_id),
      status: data.status,
    })
    .select()
    .single()

  if (error) throw error

  if (data.selectedMediaIds && data.selectedMediaIds.length > 0) {
    const mediaEntries = data.selectedMediaIds.map(mediaId => ({
      product_id: product.id,
      media_id: mediaId,
    }))

    const { error: mediaError } = await supabase
      .from('product_media')
      .insert(mediaEntries)

    if (mediaError) throw mediaError
  }

  revalidatePath('/admin/products')
  return { success: true, message: 'Producto creado exitosamente', product }
}

export async function updateProductAction(productId: number, data: ProductFormData) {
  if (!productId) throw new Error('ID de producto no encontrado')
  
  const supabase = await createClient()
  
  const { data: product, error } = await supabase
    .from('product')
    .update({
      name: data.name,
      slug: data.slug || slugify(data.name),
      stock: Number(data.stock),
      price: data.price || null,
      price_group_id: data.price_group_id || null,
      brand_id: Number(data.brand_id),
      category_id: Number(data.category_id),
      status: data.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId)
    .select()
    .single()

  if (error) throw error

  const { error: deleteError } = await supabase
    .from('product_media')
    .delete()
    .eq('product_id', productId)

  if (deleteError) throw deleteError

  if (data.selectedMediaIds && data.selectedMediaIds.length > 0) {
    const mediaEntries = data.selectedMediaIds.map(mediaId => ({
      product_id: productId,
      media_id: mediaId,
    }))

    const { error: mediaError } = await supabase
      .from('product_media')
      .insert(mediaEntries)

    if (mediaError) throw mediaError
  }

  revalidatePath('/admin/products')
  return { success: true, message: 'Producto actualizado exitosamente', product }
} 