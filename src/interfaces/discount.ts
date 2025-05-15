export interface Discount {
  id: number;
  name?: string;
  percentage: number;
  active: boolean;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface DiscountBrand {
  id: number;
  discount_id: number;
  brand_id: number;
}

export interface DiscountCategory {
  id: number;
  discount_id: number;
  category_id: number;
}

export interface DiscountProduct {
  id: number;
  discount_id: number;
  product_id: number;
}
