import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { UserTable } from "./components/user-table";

export default async function UsersPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  // Opcional: verificar si el usuario tiene permisos de superadmin/admin
  const { data: userProfile } = await supabase
    .from("user")
    .select("role")
    .eq("auth_user_id", data.user.id)
    .single();

  if (!userProfile || !["superadmin", "admin"].includes(userProfile.role)) {
    redirect("/unauthorized");
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Administración de Usuarios</h1>
      <p className="text-gray-500 mb-8">
        Gestiona los usuarios de la plataforma, edita sus datos y controla sus
        roles.
      </p>

      <UserTable />
    </div>
  );
}
