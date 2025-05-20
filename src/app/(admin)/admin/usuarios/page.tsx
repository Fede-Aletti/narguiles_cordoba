import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { UserTable } from "./components/user-table";
import { fetchUsersWithAuthEmail, type UserWithAuthEmail } from "@/actions/user-actions";

export default async function UsersPage() {
  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getUser();

  if (authError || !data?.user) {
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

  let initialUsers: UserWithAuthEmail[] = [];
  let fetchError: string | null = null;
  try {
    initialUsers = await fetchUsersWithAuthEmail();
  } catch (e: any) {
    console.error("Failed to fetch initial users:", e);
    fetchError = e.message;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Administración de Usuarios</h1>
      <p className="text-muted-foreground mb-8">
        Gestiona los usuarios de la plataforma, edita sus datos y controla sus
        roles.
      </p>
      {fetchError && (
        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
          <span className="font-medium">Error al cargar usuarios:</span> {fetchError}
        </div>
      )}
      <UserTable initialUsers={initialUsers} />
    </div>
  );
}
