"use server";

import { createClient } from "@/utils/supabase/server";
import { OrderStatus } from "@/interfaces/enums";
import { revalidatePath } from "next/cache";

/**
 * Actualiza el estado de una orden
 */
export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  if (!orderId || !Object.values(OrderStatus).includes(newStatus)) {
    throw new Error("ID de orden o estado inválido");
  }

  const supabase = await createClient();
  
  // Verificar permisos del usuario (debe ser admin, superadmin o marketing)
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    throw new Error("Usuario no autenticado");
  }

  const { data: userProfile } = await supabase
    .from("user")
    .select("role")
    .eq("auth_user_id", authUser.id)
    .single();

  if (!userProfile || !["superadmin", "admin", "marketing"].includes(userProfile.role)) {
    throw new Error("No tienes permisos para actualizar órdenes");
  }

  // Actualizar el estado de la orden
  const { data, error } = await supabase
    .from("order")
    .update({ 
      status: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq("id", orderId)
    .select("id, status")
    .single();

  if (error) {
    console.error("Error al actualizar la orden:", error);
    throw new Error(`Error al actualizar la orden: ${error.message}`);
  }

  // Revalidar rutas para actualizar la UI
  revalidatePath("/admin/orders");
  
  return data;
}

/**
 * Actualiza los detalles completos de una orden (incluye estado, items, etc.)
 */
export async function updateOrder(orderId: string, orderData: {
  status?: OrderStatus;
  total_amount?: number;
  total_items?: number;
  shipping_address_id?: string | null;
  store_pickup?: boolean;
}) {
  if (!orderId) {
    throw new Error("ID de orden inválido");
  }

  const supabase = await createClient();
  
  // Verificar permisos del usuario
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    throw new Error("Usuario no autenticado");
  }

  const { data: userProfile } = await supabase
    .from("user")
    .select("role")
    .eq("auth_user_id", authUser.id)
    .single();

  if (!userProfile || !["superadmin", "admin"].includes(userProfile.role)) {
    throw new Error("No tienes permisos para actualizar órdenes");
  }

  // Actualizar la orden
  const { data, error } = await supabase
    .from("order")
    .update({ 
      ...orderData,
      updated_at: new Date().toISOString()
    })
    .eq("id", orderId)
    .select("*")
    .single();

  if (error) {
    console.error("Error al actualizar la orden:", error);
    throw new Error(`Error al actualizar la orden: ${error.message}`);
  }

  // Revalidar rutas para actualizar la UI
  revalidatePath("/admin/orders");
  
  return data;
}

/**
 * Actualiza la cantidad de un item en una orden
 */
export async function updateOrderItemQuantity(orderId: string, itemId: string, quantity: number) {
  if (!orderId || !itemId || quantity < 0) {
    throw new Error("Parámetros inválidos");
  }

  const supabase = await createClient();
  
  // Verificar permisos del usuario
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    throw new Error("Usuario no autenticado");
  }

  const { data: userProfile } = await supabase
    .from("user")
    .select("role")
    .eq("auth_user_id", authUser.id)
    .single();

  if (!userProfile || !["superadmin", "admin"].includes(userProfile.role)) {
    throw new Error("No tienes permisos para actualizar items de órdenes");
  }

  // Actualizar el item
  const { data, error } = await supabase
    .from("order_item")
    .update({ quantity })
    .eq("id", itemId)
    .eq("order_id", orderId)
    .select("*")
    .single();

  if (error) {
    console.error("Error al actualizar el item:", error);
    throw new Error(`Error al actualizar el item: ${error.message}`);
  }

  // Recalcular los totales de la orden
  await recalculateOrderTotals(orderId);

  // Revalidar rutas para actualizar la UI
  revalidatePath("/admin/orders");
  
  return data;
}

/**
 * Elimina un item de una orden
 */
export async function removeOrderItem(orderId: string, itemId: string) {
  if (!orderId || !itemId) {
    throw new Error("Parámetros inválidos");
  }

  const supabase = await createClient();
  
  // Verificar permisos del usuario
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    throw new Error("Usuario no autenticado");
  }

  const { data: userProfile } = await supabase
    .from("user")
    .select("role")
    .eq("auth_user_id", authUser.id)
    .single();

  if (!userProfile || !["superadmin", "admin"].includes(userProfile.role)) {
    throw new Error("No tienes permisos para eliminar items de órdenes");
  }

  // Eliminar el item (borrado lógico)
  const { data, error } = await supabase
    .from("order_item")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", itemId)
    .eq("order_id", orderId)
    .select("*")
    .single();

  if (error) {
    console.error("Error al eliminar el item:", error);
    throw new Error(`Error al eliminar el item: ${error.message}`);
  }

  // Recalcular los totales de la orden
  await recalculateOrderTotals(orderId);

  // Revalidar rutas para actualizar la UI
  revalidatePath("/admin/orders");
  
  return data;
}

/**
 * Función auxiliar para recalcular los totales de una orden
 */
async function recalculateOrderTotals(orderId: string) {
  const supabase = await createClient();
  
  // Obtener todos los items no eliminados de la orden
  const { data: items, error: itemsError } = await supabase
    .from("order_item")
    .select("quantity, price_at_purchase")
    .eq("order_id", orderId)
    .is("deleted_at", null);

  if (itemsError) {
    console.error("Error al obtener items para recalcular totales:", itemsError);
    throw new Error(`Error al recalcular totales: ${itemsError.message}`);
  }

  // Calcular nuevos totales
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price_at_purchase), 0);

  // Actualizar la orden con los nuevos totales
  const { error: updateError } = await supabase
    .from("order")
    .update({ 
      total_items: totalItems,
      total_amount: totalAmount,
      updated_at: new Date().toISOString()
    })
    .eq("id", orderId);

  if (updateError) {
    console.error("Error al actualizar totales de la orden:", updateError);
    throw new Error(`Error al actualizar totales: ${updateError.message}`);
  }

  return { totalItems, totalAmount };
}

/**
 * Flujo normal de estados de una orden:
 * 
 * 1. IN_CART: La orden está en el carrito del usuario, no confirmada
 * 2. PLACED: La orden ha sido creada/realizada por el usuario
 * 3. CONFIRMED: La orden ha sido confirmada por el administrador
 * 4. PROCESSED: La orden ha sido procesada y preparada
 * 5a. PICKUP: La orden está lista para ser recogida por el cliente (en caso de retiro en tienda)
 * 5b. SHIPPED: La orden ha sido enviada al cliente (en caso de envío)
 * 6. DELIVERED: La orden ha sido entregada al cliente
 */ 