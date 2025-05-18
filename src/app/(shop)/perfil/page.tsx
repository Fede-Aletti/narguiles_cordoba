import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { UserProfileForm } from "./user-profile-form";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.getUser();

  if (error || !authData?.user) {
    redirect("/login");
  }

  // Obtener los datos del usuario desde la tabla 'user'
  const { data: userData, error: userError } = await supabase
    .from("user")
    .select("id, first_name, last_name, phone_number, gender")
    .eq("auth_user_id", authData.user.id)
    .single();

  if (userError) {
    console.error("Error al obtener datos del perfil:", userError);
  }

  return (
    <div className="container max-w-4xl mx-auto py-16 px-4 md:px-6 mt-12">
      <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-black/5 dark:bg-white/5 rounded-lg p-6">
            <h3 className="font-medium text-lg mb-4">Información de cuenta</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
            <p className="mb-4 font-medium">{authData.user.email}</p>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="mb-1">Miembro desde</p>
              <p className="font-medium">
                {new Date(authData.user.created_at || '').toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg mb-6">Editar perfil</h3>
            <UserProfileForm userData={userData} userId={userData?.id} />
          </div>
        </div>
      </div>
    </div>
  );
} 