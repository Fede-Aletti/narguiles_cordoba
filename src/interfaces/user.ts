import { GenderType, UserRole } from './enums';
import { IMediaItem } from './media';

export interface IUser {
  id: string; // UUID
  auth_user_id: string; // UUID
  first_name?: string | null;
  last_name?: string | null;
  phone_number?: string | null;
    role: UserRole;
  gender?: GenderType | null;
  avatar_image_id?: string | null; // UUID
  avatar_image?: IMediaItem | null; // Populated field
  created_at: string; // TIMESTAMPTZ
  updated_at?: string | null; // TIMESTAMPTZ
  deleted_at?: string | null; // TIMESTAMPTZ
  }
  