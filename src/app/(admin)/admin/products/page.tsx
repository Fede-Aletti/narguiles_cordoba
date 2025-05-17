import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server"; // Para proteger la página en el servidor
import { ProductsDataTable } from "./data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ProductForm } from "./product-form"; // Necesitarás este componente para el Dialog
import * as React from "react"; // Necesario si usamos DialogTrigger como componente

// Wrapper para el Dialog y el Formulario para manejar el estado de apertura
// ya que ProductForm es 'use client' y esta page es Server Component
// function CreateProductDialog() {
//   const [open, setOpen] = React.useState(false);

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button aria-label="Crear nuevo producto">
//           <PlusCircle className="mr-2 h-4 w-4" />
//           Crear Producto
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-[625px]"> {/* Ajusta el ancho según necesidad */}
//         <DialogHeader>
//           <DialogTitle>Crear Nuevo Producto</DialogTitle>
//           <DialogDescription>
//             Completa los detalles del nuevo producto. Haz clic en guardar cuando termines.
//           </DialogDescription>
//         </DialogHeader>
//         <ProductForm setOpen={setOpen} />
//       </DialogContent>
//     </Dialog>
//   );
// }


export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login"); // O a tu página de inicio de sesión
  }

  // Opcional: Verificación de rol del lado del servidor (más robusto junto con RLS y middleware)
  // const { data: userProfile } = await supabase
  //   .from('user')
  //   .select('role')
  //   .eq('auth_user_id', data.user.id)
  //   .single();

  // if (userProfile?.role !== 'admin' && userProfile?.role !== 'superadmin') {
  //   redirect('/unauthorized'); // O alguna página de "acceso denegado"
  // }

  // ProductsDataTable es un Client Component y se encargará de su propio fetching.
  // No necesitamos pasarle los datos de productos aquí directamente.

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Productos</h1>
        {/* <CreateProductDialog /> */}
      </div>
      <ProductsDataTable columns={columns} />
    </div>
  );
} 