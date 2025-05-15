export interface Address {
    id: number;
    user_id: number;
    street?: string;
    street_number?: string;
    province?: string;
    city?: string;
    postal_code?: string;
    phone_number?: string;
    created_at: string;
    updated_at?: string;
    deleted_at?: string;
  }
  