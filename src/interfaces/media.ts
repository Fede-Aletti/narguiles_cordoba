import { IUser } from './user';

export interface Media {
    id: number;
    url: string;
    alt?: string;
    created_by?: number;
    created_at: string;
    deleted_at?: string;
  }

export interface IMediaFolder {
  id: string; // UUID
  name: string;
  parent_folder_id?: string | null; // UUID
  created_at: string; // TIMESTAMPTZ
}

export interface IMediaItem {
  id: string; // UUID
  folder_id?: string | null; // UUID
  url: string;
  name?: string | null;
  tags?: string[] | null;
  created_by?: string | null; // UUID User ID
  created_by_user?: IUser | null; // Populated field
  created_at: string; // TIMESTAMPTZ
}
  