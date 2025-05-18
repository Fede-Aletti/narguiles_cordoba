import { createClient } from "@/utils/supabase/client";
import type { UserRole } from "@/interfaces/enums";

export type UserWithAuth = {
  id: number;
  auth_user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  role: UserRole;
  email: string; // desde auth.users
  created_at: string;
};

export async function fetchUsers(): Promise<UserWithAuth[]> {
  const supabase = createClient();

  // Primero obtenemos los usuarios de nuestra tabla
  const { data: users, error } = await supabase
    .from("user")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!users) return [];

  // Luego obtenemos los emails desde auth.users para cada usuario
  const usersWithEmail = await Promise.all(
    users.map(async (user) => {
      const { data: authData } = await supabase
        .from("auth.users") // Esto podría requerir permisos especiales
        .select("email")
        .eq("id", user.auth_user_id)
        .single();

      return {
        ...user,
        email: authData?.email || "No disponible",
      } as UserWithAuth;
    })
  );

  return usersWithEmail;
}

export async function updateUser({
  id,
  first_name,
  last_name,
  phone_number,
  role,
}: {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  phone_number?: string | null;
  role: UserRole;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user")
    .update({
      first_name,
      last_name,
      phone_number,
      role,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deactivateUser(id: number) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user")
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
