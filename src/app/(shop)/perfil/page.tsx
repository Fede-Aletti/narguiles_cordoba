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

  if (userError && userError.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine if profile not created
    console.error("Error al obtener datos del perfil:", userError);
    // Optionally, you could redirect or show a generic error message to the user here
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <div className="container max-w-4xl mx-auto py-8 px-4 md:px-6">
        <h1 className="text-3xl font-bold text-gold-400 mb-10">Mi Perfil</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-gray-900 rounded-lg p-6 shadow-lg">
              <h3 className="font-semibold text-xl text-white mb-6">Información de Cuenta</h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-1">Email</p>
                <p className="font-medium text-gray-200 break-all">{authData.user.email}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400 mb-1">Miembro desde</p>
                <p className="font-medium text-gray-200">
                  {new Date(authData.user.created_at || Date.now()).toLocaleDateString('es-ES', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <div className="bg-gray-900 rounded-lg shadow-lg p-6">
              <h3 className="font-semibold text-xl text-white mb-6">Editar Perfil</h3>
              <UserProfileForm userData={userData || undefined} userId={userData?.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 