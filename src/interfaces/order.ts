import { OrderStatus } from "./enums";

export interface Order {
  id: number;
  user_id: number;
  status: OrderStatus;
  total?: number;
  total_quantity?: number;
  shipping_address_id?: number;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price_at_purchase: number;
  created_at: string;
  deleted_at?: string;
}
