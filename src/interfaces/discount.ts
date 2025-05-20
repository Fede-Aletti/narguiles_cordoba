import { IBrand } from "./brand";
import { ICategory } from "./category";
import { IProduct } from "./product";

export type DiscountType = 'percentage' | 'fixed_amount';

export interface IDiscount {
  id: string; // UUID
  name: string; // Changed from optional to required as per DB
  description?: string | null;
  code?: string | null; // For coupon codes
  discount_type: DiscountType;
  value: number; // NUMERIC(10,2) - Percentage (e.g., 10 for 10%) or fixed amount
  minimum_purchase_amount?: number | null; // NUMERIC(10,2)
  start_date?: string | null; // TIMESTAMPTZ
  end_date?: string | null; // TIMESTAMPTZ
  usage_limit?: number | null;
  is_active: boolean; // Renamed from 'active' for clarity and matching DB
  created_at: string; // TIMESTAMPTZ
  updated_at?: string | null; // TIMESTAMPTZ
  deleted_at?: string | null; // TIMESTAMPTZ
  brands?: IBrand[]; // From discount_brand
  categories?: ICategory[]; // From discount_category
  products?: IProduct[]; // From discount_product
  // created_by and created_by_user could be added if needed from DB schema
}

export interface IDiscountBrand {
  id: string; // UUID
  discount_id: string; // UUID
  brand_id: string; // UUID
}

export interface IDiscountCategory {
  id: string; // UUID
  discount_id: string; // UUID
  category_id: string; // UUID
}

export interface IDiscountProduct {
  id: string; // UUID
  discount_id: string; // UUID
  product_id: string; // UUID
}
