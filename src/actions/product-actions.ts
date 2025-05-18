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

export async function createProductAction(
  formData: ProductFormData
): Promise<{ success: boolean; message: string; product?: any }> {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    return { success: false, message: 'Usuario no autenticado.' }
  }

  // Obtener el ID del perfil de usuario desde la tabla 'user'
  const { data: userProfile, error: profileError } = await supabase
    .from('user')
    .select('id, role') // También obtenemos el rol para verificar permisos si es necesario aquí
    .eq('auth_user_id', authUser.id)
    .single()

  if (profileError || !userProfile) {
    console.error('Error fetching user profile or profile not found:', profileError)
    return { success: false, message: 'Perfil de usuario no encontrado o error al obtenerlo.' }
  }
  
  // Opcional: Verificar rol si no se confía solo en RLS para esta acción específica
  // if (userProfile.role !== 'admin' && userProfile.role !== 'superadmin') {
  //   return { success: false, message: 'No tienes permiso para crear productos.' };
  // }

  const productToInsert = {
    name: formData.name,
    slug: formData.slug || slugify(formData.name), // Generar slug si no se provee
    stock: Number(formData.stock),
    price: formData.price ? Number(formData.price) : null,
    price_group_id: formData.price_group_id ? Number(formData.price_group_id) : null,
    brand_id: Number(formData.brand_id),
    category_id: Number(formData.category_id),
    status: formData.status as ProductStatus, // Asegurar el tipo
    created_by: userProfile.id, // ID de la tabla user
    media_id: formData.media_id || null,
    // deleted_at se omite, es null por defecto
  }

  // Validaciones adicionales aquí (ej. con Zod) serían ideales

  const { data: newProduct, error } = await supabase
    .from('product')
    .insert(productToInsert)
    .select()
    .single()

  if (error) {
    console.error('Error creating product:', error)
    return { success: false, message: `Error al crear el producto: ${error.message}` }
  }

  revalidatePath('/admin/products') // Revalida la página de la lista de productos
  return { success: true, message: 'Producto creado exitosamente.', product: newProduct }
}

export async function updateProductAction(
  productId: number,
  formData: ProductFormData
): Promise<{ success: boolean; message: string; product?: any }> {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    return { success: false, message: 'Usuario no autenticado.' }
  }

  // Obtener el ID del perfil de usuario
  const { data: userProfile, error: profileError } = await supabase
    .from('user')
    .select('id, role')
    .eq('auth_user_id', authUser.id)
    .single()

  if (profileError || !userProfile) {
    console.error('Error fetching user profile:', profileError)
    return { success: false, message: 'Perfil de usuario no encontrado.' }
  }

  // Verificar que el producto existe
  const { data: existingProduct, error: productError } = await supabase
    .from('product')
    .select('*')
    .eq('id', productId)
    .single()

  if (productError || !existingProduct) {
    return { success: false, message: 'Producto no encontrado.' }
  }

  const productToUpdate = {
    name: formData.name,
    slug: formData.slug || existingProduct.slug,
    stock: Number(formData.stock),
    price: formData.price ? Number(formData.price) : null,
    price_group_id: formData.price_group_id ? Number(formData.price_group_id) : null,
    brand_id: Number(formData.brand_id),
    category_id: Number(formData.category_id),
    status: formData.status,
    updated_at: new Date().toISOString(),
    media_id: formData.media_id || existingProduct.media_id,
  }

  const { data: updatedProduct, error } = await supabase
    .from('product')
    .update(productToUpdate)
    .eq('id', productId)
    .select()
    .single()

  if (error) {
    console.error('Error updating product:', error)
    return { success: false, message: `Error al actualizar el producto: ${error.message}` }
  }

  revalidatePath('/admin/products')
  return { success: true, message: 'Producto actualizado exitosamente.', product: updatedProduct }
} 