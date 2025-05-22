// src/app/admin/catalogo/brand-table.tsx
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  // fetchBrands, // No longer fetched here
  createBrand,
  updateBrand,
  deleteBrand,
  restoreBrand,
} from "@/actions/brand-actions"; // Corrected path
import { BrandForm } from "./brand-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { IBrand } from "@/interfaces/brand";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


interface BrandTableProps {
  initialBrands: IBrand[];
}

export function BrandTable({ initialBrands }: BrandTableProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editBrand, setEditBrand] = useState<IBrand | null>(null);
  const [brands, setBrands] = useState<IBrand[]>(initialBrands);
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    setBrands(initialBrands);
  }, [initialBrands]);

  // Use query for client-side state management if needed, but initial data is from props
  const { data: queryBrands = [], isLoading, refetch } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => initialBrands, // Use initial data
    initialData: initialBrands,
    enabled: false, // No initial fetch, data comes from props
  });

   useEffect(() => {
    // Sync local state if query data changes (e.g., after invalidation)
    if (queryBrands) {
      setBrands(queryBrands.filter(brand => showDeleted ? true : !brand.deleted_at));
    }
  }, [queryBrands, showDeleted]);


  const createMutation = useMutation({
    mutationFn: createBrand,
    onSuccess: (newBrand) => {
      toast.success("Marca creada");
      // queryClient.invalidateQueries({ queryKey: ["brands"] });
      setBrands(prev => [newBrand, ...prev].filter(brand => showDeleted ? true : !brand.deleted_at));
      setOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async (variables: { id: string; payload: { name: string; description?: string | null; image_id?: string | null } }) => {
      return updateBrand(variables.id, variables.payload);
    },
    onSuccess: (updatedBrand) => {
      toast.success("Marca actualizada");
      // queryClient.invalidateQueries({ queryKey: ["brands"] });
      setBrands(prev => prev.map(b => b.id === updatedBrand.id ? updatedBrand : b).filter(brand => showDeleted ? true : !brand.deleted_at));
      setEditBrand(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBrand,
    onSuccess: (_, brandId) => {
      toast.success("Marca eliminada (soft delete)");
      // queryClient.invalidateQueries({ queryKey: ["brands"] });
      setBrands(prev => prev.map(b => b.id === brandId ? { ...b, deleted_at: new Date().toISOString() } : b).filter(brand => showDeleted ? true : !brand.deleted_at));
    },
    onError: (e: any) => toast.error(e.message),
  });

  const restoreMutation = useMutation({
    mutationFn: restoreBrand,
    onSuccess: (restoredBrand) => {
      toast.success("Marca restaurada");
      // queryClient.invalidateQueries({ queryKey: ["brands"] });
      setBrands(prev => prev.map(b => b.id === restoredBrand.id ? restoredBrand : b).filter(brand => showDeleted ? true : !brand.deleted_at));
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filteredBrands = brands.filter(brand => 
    showDeleted ? true : !brand.deleted_at
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">Marcas</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowDeleted(!showDeleted)}>
            {showDeleted ? "Ocultar Eliminadas" : "Mostrar Eliminadas"}
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Crear Marca</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva Marca</DialogTitle>
              </DialogHeader>
              <BrandForm
                onSubmit={(data) => createMutation.mutate(data)}
                loading={createMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <table className="min-w-full border mt-2">
        <thead>
          <tr>
            <th className="text-left p-2">Nombre</th>
            <th className="text-left p-2">Creado</th>
            <th className="text-left p-2">Estado</th>
            <th className="text-left p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && initialBrands.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-2 text-center">Cargando...</td>
            </tr>
          ) : filteredBrands.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-2 text-center">No hay marcas para mostrar.</td>
            </tr>
          ) : (
            filteredBrands.map((brand) => (
              <tr key={brand.id} className={brand.deleted_at ? "bg-red-100 line-through" : ""}>
                <td className="p-2">{brand.name}</td>
                <td className="p-2">
                  {new Date(brand.created_at).toLocaleDateString()}
                </td>
                <td className="p-2">
                  {brand.deleted_at ? "Eliminada" : "Activa"}
                </td>
                <td className="p-2 space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditBrand(brand)}
                    disabled={!!brand.deleted_at}
                  >
                    Editar
                  </Button>
                   {!brand.deleted_at ? (
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">Eliminar</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción marcará la marca como eliminada. Podrás restaurarla más tarde.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate(brand.id)}>
                            Confirmar Eliminación
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => restoreMutation.mutate(brand.id)}
                    >
                      Restaurar
                    </Button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <Dialog
        open={!!editBrand}
        onOpenChange={(openState) => !openState && setEditBrand(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Marca</DialogTitle>
          </DialogHeader>
          {editBrand && (
            <BrandForm
              defaultValues={{ name: editBrand.name, description: editBrand.description, image_id: editBrand.image_id }}
              onSubmit={(data) => {
                if (editBrand?.id) {
                   const payload: { name: string; description?: string | null; image_id?: string | null } = { name: data.name };
                  if (data.description !== undefined) payload.description = data.description;
                  if (data.image_id !== undefined) payload.image_id = data.image_id;
                  updateMutation.mutate({ id: editBrand.id, payload });
                }
              }}
              loading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
