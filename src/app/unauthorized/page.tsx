import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { ShieldX, Home, ShoppingBag, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function UnauthorizedPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const isLoggedIn = !!data.user;

  // Opcionalmente obtener el rol del usuario si está logueado
  let userRole = null;
  if (isLoggedIn) {
    const { data: userData } = await supabase
      .from("user")
      .select("role")
      .eq("auth_user_id", data.user.id)
      .single();
    userRole = userData?.role;
  }

  async function handleLogout() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="flex justify-center">
          <div className="p-3 bg-red-100 rounded-full">
            <ShieldX size={48} className="text-red-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-gray-900">
          Acceso Denegado
        </h1>
        
        <p className="text-center text-gray-600">
          No tienes permisos para acceder a esta área.
          {userRole && (
            <span className="block mt-2">
              Tu rol actual es <span className="font-semibold">{userRole}</span>, pero se requiere un rol administrativo.
            </span>
          )}
        </p>

        <div className="pt-4 space-y-3">
          <Link href="/" className="w-full">
            <Button variant="default" className="w-full flex items-center justify-center gap-2">
              <Home size={16} />
              Ir al Inicio
            </Button>
          </Link>
          
          {userRole === 'client' && (
            <Link href="/shop" className="w-full">
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <ShoppingBag size={16} />
                Ir a la Tienda
              </Button>
            </Link>
          )}
          
          {isLoggedIn && (
            <form action={handleLogout} className="w-full">
              <Button variant="ghost" className="w-full text-red-600 flex items-center justify-center gap-2">
                <LogOut size={16} />
                Cerrar Sesión
              </Button>
            </form>
          )}
        </div>
      </div>
      
      <p className="mt-8 text-sm text-gray-500">
        Si crees que esto es un error, por favor contacta al administrador.
      </p>
    </div>
  );
} 