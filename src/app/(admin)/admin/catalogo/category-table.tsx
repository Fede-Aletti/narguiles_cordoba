// src/app/admin/catalogo/category-table.tsx
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCategories,
  createCategory,
  updateCategory,
} from "./category-queries";
import { CategoryForm } from "./category-form";
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

export function CategoryTable() {
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
  const [open, setOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success("Categoría creada");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      toast.success("Categoría actualizada");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditCategory(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">Categorías</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Crear Categoría</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Categoría</DialogTitle>
            </DialogHeader>
            <CategoryForm
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
            categories.map((cat) => (
              <tr key={cat.id}>
                <td className="p-2">{cat.name}</td>
                <td className="p-2">
                  {new Date(cat.created_at).toLocaleDateString()}
                </td>
                <td className="p-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditCategory(cat)}
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
        open={!!editCategory}
        onOpenChange={(open) => !open && setEditCategory(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoría</DialogTitle>
          </DialogHeader>
          <CategoryForm
            defaultValues={editCategory ?? undefined}
            onSubmit={(data) =>
              updateMutation.mutate({ id: editCategory!.id, ...data })
            }
            loading={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
