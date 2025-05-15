import { GenderType, UserRole } from "./enums";

export interface User {
    id: number;
    auth_user_id: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    role: UserRole;
    gender?: GenderType;
    created_at: string;
    updated_at?: string;
    deleted_at?: string;
  }
  