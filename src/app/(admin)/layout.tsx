import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  // Obtener el perfil del usuario para verificar el rol
  const { data: userProfile, error: profileError } = await supabase
    .from("user")
    .select("role")
    .eq("auth_user_id", data.user.id)
    .single();

  // Si hay error o el usuario es de tipo 'client', no tiene acceso
  if (profileError || userProfile?.role === "client") {
    redirect("/unauthorized"); // O redirigir a /shop si es client
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header para Admin */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="container mx-auto flex justify-between items-center">
          <p className="font-bold text-xl">Admin Panel</p>
          <nav className="flex space-x-4">
            <Link href="/admin/dashboard" className="hover:text-blue-600">Dashboard</Link>
            <Link href="/admin/products" className="hover:text-blue-600">Productos</Link>
            <Link href="/admin/catalogo" className="hover:text-blue-600">Catálogo</Link>
            <Link href="/admin/media" className="hover:text-blue-600">Media</Link>
            <Link href="/admin/price-groups" className="hover:text-blue-600">Precios</Link>
            {/* Más enlaces según necesites */}
          </nav>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer para Admin */}
      <footer className="border-t border-gray-200 py-4 text-center text-gray-500">
        Panel de Administración © {new Date().getFullYear()}
      </footer>
    </div>
  );
} 