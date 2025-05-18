"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

type ProfileData = {
  first_name: string;
  last_name: string;
  phone_number?: string;
  gender?: string;
};

export async function updateUserProfile(userId: number, data: ProfileData) {
  const supabase = await createClient();

  // Verificar que el usuario esté autenticado
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return { success: false, error: "Usuario no autenticado" };
  }

  // Verificar que el usuario está editando su propio perfil
  const { data: userData, error: userError } = await supabase
    .from("user")
    .select("auth_user_id")
    .eq("id", userId)
    .single();

  if (userError || userData.auth_user_id !== authData.user.id) {
    return { success: false, error: "No tienes permiso para editar este perfil" };
  }

  // Actualizar el perfil
  const { error: updateError } = await supabase
    .from("user")
    .update({
      first_name: data.first_name,
      last_name: data.last_name,
      phone_number: data.phone_number || null,
      gender: data.gender || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Revalidar la ruta para mostrar los datos actualizados
  revalidatePath("/perfil");
  
  return { success: true };
} 