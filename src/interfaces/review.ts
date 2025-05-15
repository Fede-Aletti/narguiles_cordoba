export interface Review {
  id: number;
  user_id: number;
  product_id?: number;
  brand_id?: number;
  rating: number; // 1–5
  comment?: string;
  created_at: string;
  deleted_at?: string;
}
