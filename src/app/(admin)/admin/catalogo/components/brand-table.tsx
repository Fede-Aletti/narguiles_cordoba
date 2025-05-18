// src/app/admin/catalogo/brand-table.tsx
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBrands, createBrand, updateBrand } from "@/actions/brand-actions";
import { BrandForm } from "./brand-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";

export function BrandTable() {
  const queryClient = useQueryClient();
  const { data: brands = [], isLoading } = useQuery({
    queryKey: ["brands"],
    queryFn: fetchBrands,
  });
  const [open, setOpen] = useState(false);
  const [editBrand, setEditBrand] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const createMutation = useMutation({
    mutationFn: createBrand,
    onSuccess: () => {
      toast.success("Marca creada");
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: updateBrand,
    onSuccess: () => {
      toast.success("Marca actualizada");
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setEditBrand(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">Marcas</h2>
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
      <table className="min-w-full border mt-2">
        <thead>
          <tr>
            <th className="text-left p-2">Nombre</th>
            <th className="text-left p-2">Creado</th>
            <th className="text-left p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={3}>Cargando...</td>
            </tr>
          ) : (
            brands.map((brand) => (
              <tr key={brand.id}>
                <td className="p-2">{brand.name}</td>
                <td className="p-2">
                  {new Date(brand.created_at).toLocaleDateString()}
                </td>
                <td className="p-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditBrand(brand)}
                  >
                    Editar
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <Dialog
        open={!!editBrand}
        onOpenChange={(open) => !open && setEditBrand(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Marca</DialogTitle>
          </DialogHeader>
          <BrandForm
            defaultValues={editBrand ?? undefined}
            onSubmit={(data) =>
              updateMutation.mutate({ id: editBrand!.id, ...data })
            }
            loading={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
