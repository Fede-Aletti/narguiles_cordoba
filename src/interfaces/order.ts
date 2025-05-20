import { OrderStatus } from "./enums";
import { IUser } from "./user";
import { IAddress } from "./address";
import { IProduct } from "./product";

export interface IOrderItem {
  id: string; // UUID
  order_id: string; // UUID
  product_id?: string | null; // UUID
  product?: IProduct | null; // Populated field
  quantity: number;
  price_at_purchase: number; // NUMERIC(10,2)
  created_at: string; // TIMESTAMPTZ
  deleted_at?: string | null; // TIMESTAMPTZ
}

export interface IOrder {
  id: string; // UUID
  user_id?: string | null; // UUID
  user?: IUser | null; // Populated field
  status: OrderStatus;
  store_pickup: boolean;
  shipping_address_id?: string | null; // UUID
  shipping_address?: IAddress | null; // Populated field
  total_amount?: number | null; // NUMERIC(10,2)
  total_items?: number | null;
  order_items?: IOrderItem[]; // Populated field
  created_at: string; // TIMESTAMPTZ
  updated_at?: string | null; // TIMESTAMPTZ
  deleted_at?: string | null; // TIMESTAMPTZ
}
