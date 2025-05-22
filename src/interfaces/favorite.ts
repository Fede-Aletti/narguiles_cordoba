import { IUser } from './user';
import { IProduct } from './product';

export interface IFavorite {
  id: string; // UUID
  user_id: string; // UUID
  user?: IUser; // Populated field
  product_id: string; // UUID
  product?: IProduct; // Populated field
  created_at: string; // TIMESTAMPTZ
} 