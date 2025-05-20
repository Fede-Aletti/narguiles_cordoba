import { IBrand } from "./brand";
import { ICategory } from "./category";
import { IProduct } from "./product";

export interface IDiscount {
  id: string; // UUID
  name?: string | null;
  percentage?: number | null; // NUMERIC(5,2)
  active: boolean;
  created_at: string; // TIMESTAMPTZ
  updated_at?: string | null; // TIMESTAMPTZ
  deleted_at?: string | null; // TIMESTAMPTZ
  brands?: IBrand[]; // From discount_brand
  categories?: ICategory[]; // From discount_category
  products?: IProduct[]; // From discount_product
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
