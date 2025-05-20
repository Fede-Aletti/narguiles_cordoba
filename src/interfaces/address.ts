export interface IAddress {
  id: string; // UUID
  user_id?: string | null; // UUID
  street?: string | null;
  street_number?: string | null;
  province?: string | null;
  city?: string | null;
  postal_code?: string | null;
  phone_number?: string | null;
  created_at: string; // TIMESTAMPTZ
  updated_at?: string | null; // TIMESTAMPTZ
  deleted_at?: string | null; // TIMESTAMPTZ
}
  