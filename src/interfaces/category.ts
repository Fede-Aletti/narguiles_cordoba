import { IMediaItem } from './media';
import { IUser } from './user';

export interface ICategory {
  id: string; // UUID
  name: string;
  description?: string | null;
  image_id?: string | null; // UUID
  image?: IMediaItem | null; // Populated field
  created_by?: string | null; // UUID User ID
  created_by_user?: IUser | null; // Populated field
  created_at: string; // TIMESTAMPTZ
  updated_at?: string | null; // TIMESTAMPTZ
  deleted_at?: string | null; // TIMESTAMPTZ
}
