import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function PrivatePage() {
  const supabase = await createClient();
  
  // Primero obtenemos los datos de autenticación
  const { data: authData, error } = await supabase.auth.getUser();
  if (error || !authData?.user) {
    redirect("/login");
  }

  // Ahora obtenemos los datos del usuario desde la tabla 'user'
  const { data: userData, error: userError } = await supabase
    .from("user")
    .select("id, first_name, last_name, role, phone_number")
    .eq("auth_user_id", authData.user.id)
    .single();

  if (userError) {
    console.error("Error fetching user data:", userError);
    // Puedes manejar el error como prefieras, por ejemplo:
    // return <div>Error cargando datos de usuario</div>;
  }

  // Preparamos el nombre para mostrar
  const displayName = userData
    ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || authData.user.email
    : authData.user.email;

  const adminSections = [
    {
      title: "Productos",
      description: "Gestionar el catálogo de productos",
      href: "/admin/products",
      color: "bg-blue-500",
      icon: "📦",
    },
    {
      title: "Categorías y Marcas",
      description: "Administrar categorías y marcas del catálogo",
      href: "/admin/catalogo",
      color: "bg-purple-500",
      icon: "🏷️",
    },
    {
      title: "Media",
      description: "Gestionar recursos multimedia",
      href: "/admin/media",
      color: "bg-green-500",
      icon: "🖼️",
    },
    {
      title: "Grupos de Precios",
      description: "Configurar grupos de precios",
      href: "/admin/price-groups",
      color: "bg-orange-500",
      icon: "💰",
    },
    {
      title: "Descuentos",
      description: "Gestionar descuentos y promociones",
      href: "/admin/discounts",
      color: "bg-red-500",
      icon: "🏷️",
    },
  ];

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>
      
      <p className="mb-8 text-gray-500">
        Bienvenido, <span className="font-medium">{displayName}</span>
        {userData?.role && <span className="ml-2 text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded-full">{userData.role}</span>}
        . ¿Qué deseas administrar hoy?
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminSections.map((section) => (
          <Link 
            key={section.href}
            href={section.href}
            className="block group"
          >
            <div className={`h-full rounded-lg p-6 hover:shadow-lg transition-shadow border border-gray-200 hover:border-gray-300`}>
              <div className="flex items-center gap-4 mb-3">
                <div className={`${section.color} w-12 h-12 flex items-center justify-center rounded-full text-white text-xl`}>
                  {section.icon}
                </div>
                <h2 className="text-xl font-semibold">{section.title}</h2>
              </div>
              <p className="text-gray-600">{section.description}</p>
              <div className="mt-4 text-right">
                <span className="text-blue-600 group-hover:underline">Gestionar &rarr;</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Puedes mantener la información de debug si lo deseas */}
      {/* <div className="mt-10 p-4 bg-gray-800 rounded">
        <h3 className="font-bold text-lg mb-2">Datos de usuario:</h3>
        <pre className="text-xs overflow-auto">{JSON.stringify(data, null, 2)}</pre>
      </div> */}
    </div>
  );
}
