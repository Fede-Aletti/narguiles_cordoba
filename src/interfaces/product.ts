import { ProductStatus } from "./enums";

export interface Product {
  id: number;
  name: string;
  slug: string;
  stock: number;
  price?: number;
  price_group_id?: number;
  brand_id?: number;
  category_id?: number;
  status: ProductStatus;
  created_by?: number;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface ProductMedia {
  id: number;
  product_id: number;
  media_id: number;
}
