"use server";

import { createClient } from '@/utils/supabase/server';
import type { IOrder, IOrderItem, IOrderUser } from '@/interfaces/order';
import type { IUser } from '@/interfaces/user';
import type { IAddress } from '@/interfaces/address';
import type { IProduct } from '@/interfaces/product';

const ORDER_SELECT_QUERY = `
  id, 
  user_id, 
  status, 
  store_pickup,
  shipping_address_id,
  total_amount,
  total_items,
  created_at,
  updated_at,
  deleted_at,
  user:user_id (id, first_name, last_name, email),
  shipping_address:shipping_address_id (*),
  order_items:order_item (
    id,
    product_id,
    quantity,
    price_at_purchase,
    product:product_id (id, name, slug)
  )
`;

function mapRawOrderToIOrder(rawOrder: any): IOrder {
  return {
    id: rawOrder.id,
    user_id: rawOrder.user_id,
    status: rawOrder.status,
    store_pickup: rawOrder.store_pickup,
    shipping_address_id: rawOrder.shipping_address_id,
    total_amount: rawOrder.total_amount,
    total_items: rawOrder.total_items,
    created_at: rawOrder.created_at,
    updated_at: rawOrder.updated_at,
    deleted_at: rawOrder.deleted_at,
    user: rawOrder.user as IOrderUser | null,
    shipping_address: rawOrder.shipping_address as IAddress | null,
    order_items: rawOrder.order_items?.map((oi: any) => ({
      id: oi.id,
      order_id: rawOrder.id,
      product_id: oi.product_id,
      quantity: oi.quantity,
      price_at_purchase: oi.price_at_purchase,
      product: oi.product as IProduct | null,
      created_at: oi.created_at, // Assuming order_item has created_at
    })) as IOrderItem[] | undefined,
  };
}

export async function fetchOrders(): Promise<IOrder[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('order')
    .select(ORDER_SELECT_QUERY)
    .is('deleted_at', null) // Typically orders aren't soft-deleted, but good practice if schema supports
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error.message);
    throw new Error(`Failed to fetch orders: ${error.message}`);
  }

  return data ? data.map(mapRawOrderToIOrder) : [];
}

// TODO: Add actions for updating order status, etc. 