// src/app/admin/catalogo/category-table.tsx
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  // fetchCategories, // No longer fetched here
  createCategory,
  updateCategory,
  deleteCategory,
  restoreCategory,
} from "@/actions/category-actions"; // Corrected path
import { CategoryForm } from "./category-form";
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
import type { ICategory } from "@/interfaces/category";
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

interface CategoryTableProps {
  initialCategories: ICategory[];
}

export function CategoryTable({ initialCategories }: CategoryTableProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<ICategory | null>(null);
  const [categories, setCategories] = useState<ICategory[]>(initialCategories);
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  // Use query for client-side state management if needed, but initial data is from props
  const { data: queryCategories = [], isLoading, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => initialCategories, // Use initial data
    initialData: initialCategories,
    enabled: false, // No initial fetch, data comes from props
  });

  useEffect(() => {
    // Sync local state if query data changes (e.g., after invalidation)
    // This might be redundant if mutations directly update `categories` state
    if (queryCategories) {
      setCategories(queryCategories.filter(cat => showDeleted ? true : !cat.deleted_at));
    }
  }, [queryCategories, showDeleted]);


  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (newCategory) => {
      toast.success("Categoría creada");
      // queryClient.invalidateQueries({ queryKey: ["categories"] });
      setCategories(prev => [newCategory, ...prev].filter(cat => showDeleted ? true : !cat.deleted_at));
      setOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async (variables: { id: string; payload: { name: string; description?: string | null; image_id?: string | null } }) => {
      return updateCategory(variables.id, variables.payload);
    },
    onSuccess: (updatedCategory) => {
      toast.success("Categoría actualizada");
      // queryClient.invalidateQueries({ queryKey: ["categories"] });
      setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c).filter(cat => showDeleted ? true : !cat.deleted_at));
      setEditCategory(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: (_, categoryId) => {
      toast.success("Categoría eliminada (soft delete)");
      // queryClient.invalidateQueries({ queryKey: ["categories"] });
      setCategories(prev => prev.map(c => c.id === categoryId ? { ...c, deleted_at: new Date().toISOString() } : c).filter(cat => showDeleted ? true : !cat.deleted_at));
    },
    onError: (e: any) => toast.error(e.message),
  });

  const restoreMutation = useMutation({
    mutationFn: restoreCategory,
    onSuccess: (restoredCategory) => {
      toast.success("Categoría restaurada");
      // queryClient.invalidateQueries({ queryKey: ["categories"] });
      setCategories(prev => prev.map(c => c.id === restoredCategory.id ? restoredCategory : c).filter(cat => showDeleted ? true : !cat.deleted_at));
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filteredCategories = categories.filter(category => 
    showDeleted ? true : !category.deleted_at
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">Categorías</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowDeleted(!showDeleted)}>
            {showDeleted ? "Ocultar Eliminadas" : "Mostrar Eliminadas"}
          </Button>
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
          {isLoading && initialCategories.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-2 text-center">Cargando...</td>
            </tr>
          ) : filteredCategories.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-2 text-center">No hay categorías para mostrar.</td>
            </tr>
          ) : (
            filteredCategories.map((cat) => (
              <tr key={cat.id} className={cat.deleted_at ? "bg-red-100 line-through" : ""}>
                <td className="p-2">{cat.name}</td>
                <td className="p-2">
                  {new Date(cat.created_at).toLocaleDateString()}
                </td>
                <td className="p-2">
                  {cat.deleted_at ? "Eliminada" : "Activa"}
                </td>
                <td className="p-2 space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditCategory(cat)}
                    disabled={!!cat.deleted_at}
                  >
                    Editar
                  </Button>
                  {!cat.deleted_at ? (
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">Eliminar</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción marcará la categoría como eliminada. Podrás restaurarla más tarde.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate(cat.id)}>
                            Confirmar Eliminación
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => restoreMutation.mutate(cat.id)}
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
        open={!!editCategory}
        onOpenChange={(openState) => !openState && setEditCategory(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoría</DialogTitle>
          </DialogHeader>
          {editCategory && (
            <CategoryForm
              defaultValues={{ name: editCategory.name, description: editCategory.description, image_id: editCategory.image_id }}
              onSubmit={(data) => {
                if (editCategory?.id) {
                  const payload: { name: string; description?: string | null; image_id?: string | null } = { name: data.name };
                  if (data.description !== undefined) payload.description = data.description;
                  if (data.image_id !== undefined) payload.image_id = data.image_id;
                  updateMutation.mutate({ id: editCategory.id, payload });
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
