import { IUser } from './user';
import { IProduct } from './product';
import { IBrand } from './brand';

export interface IReview {
  id: string; // UUID
  user_id: string; // UUID
  user?: IUser; // Populated field
  product_id?: string | null; // UUID
  product?: IProduct | null; // Populated field
  brand_id?: string | null; // UUID
  brand?: IBrand | null; // Populated field
  rating: number; // INTEGER (1-5)
  comment?: string | null;
  created_at: string; // TIMESTAMPTZ
  deleted_at?: string | null; // TIMESTAMPTZ
}
