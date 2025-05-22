import { IUser } from './user';

export interface IPriceGroup {
  id: string; // UUID
  name: string;
  price: number; // NUMERIC(10,2)
  created_by?: string | null; // UUID User ID
  created_by_user?: IUser | null; // Populated field
  created_at: string; // TIMESTAMPTZ
  updated_at?: string | null; // TIMESTAMPTZ
  deleted_at?: string | null; // TIMESTAMPTZ
}
