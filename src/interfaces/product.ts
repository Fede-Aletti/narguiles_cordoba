import { ProductStatus } from "./enums";
import { IPriceGroup } from './price-group';
import { IBrand } from './brand';
import { ICategory } from './category';
import { IUser } from './user';
import { IMediaItem } from './media';

export interface IProductMedia {
  id: string; // UUID
  product_id: string; // UUID
  media_id: string; // UUID
  media?: IMediaItem; // Populated field
}

export interface IProduct {
  id: string; // UUID
  name: string;
  slug: string;
  description?: string | null;
  stock: number;
  price?: number | null; // NUMERIC(10,2)
  price_group_id?: string | null; // UUID
  price_group?: IPriceGroup | null; // Populated field
  brand_id?: string | null; // UUID
  brand?: IBrand | null; // Populated field
  category_id?: string | null; // UUID
  category?: ICategory | null; // Populated field
  status: ProductStatus;
  images?: IMediaItem[] | null; // Derived from product_media
  product_media?: IProductMedia[] | null; // For joining
  created_by?: string | null; // UUID User ID
  created_by_user?: IUser | null; // Populated field
  created_at: string; // TIMESTAMPTZ
  updated_at?: string | null; // TIMESTAMPTZ
  deleted_at?: string | null; // TIMESTAMPTZ
}
