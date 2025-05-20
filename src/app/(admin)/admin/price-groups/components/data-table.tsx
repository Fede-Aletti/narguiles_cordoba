// src/app/admin/price-groups/components/data-table.tsx
"use client";
import { useQuery, useMutation, useQueryClient, MutationFunction } from "@tanstack/react-query";
import { PriceGroupForm, PriceFormValues } from "./price-group-form";
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
import {
  createPriceGroup,
  updatePriceGroup,
  deletePriceGroup,
  restorePriceGroup
} from "@/actions/price-group-actions";
import type { IPriceGroup } from "@/interfaces/price-group";
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
} from "@/components/ui/alert-dialog";

interface PriceGroupTableProps {
  initialPriceGroups: IPriceGroup[];
}

export function PriceGroupTable({ initialPriceGroups }: PriceGroupTableProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<IPriceGroup | null>(null);
  const [priceGroups, setPriceGroups] = useState<IPriceGroup[]>(initialPriceGroups);
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    setPriceGroups(initialPriceGroups);
  }, [initialPriceGroups]);

  const { data: queryPriceGroups = [], isLoading } = useQuery({
    queryKey: ["priceGroups"],
    queryFn: async () => initialPriceGroups,
    initialData: initialPriceGroups,
    enabled: false,
  });

  useEffect(() => {
    if (queryPriceGroups) {
      setPriceGroups(queryPriceGroups.filter(pg => showDeleted ? true : !pg.deleted_at));
    }
  }, [queryPriceGroups, showDeleted]);

  const createMutation = useMutation({
    mutationFn: createPriceGroup,
    onSuccess: (newGroup) => {
      toast.success("Grupo de precio creado");
      setPriceGroups(prev => [newGroup, ...prev].filter(pg => showDeleted ? true : !pg.deleted_at));
      setOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: (variables: { id: string; payload: PriceFormValues }) => 
      updatePriceGroup(variables.id, variables.payload),
    onSuccess: (updatedGroup) => {
      toast.success("Grupo de precio actualizado");
      setPriceGroups(prev => prev.map(pg => pg.id === updatedGroup.id ? updatedGroup : pg).filter(pg => showDeleted ? true : !pg.deleted_at));
      setEditGroup(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePriceGroup,
    onSuccess: (_, groupId) => {
      toast.success("Grupo de precio eliminado (soft delete)");
      setPriceGroups(prev => prev.map(pg => pg.id === groupId ? { ...pg, deleted_at: new Date().toISOString() } : pg).filter(pg => showDeleted ? true : !pg.deleted_at));
    },
    onError: (e: any) => toast.error(e.message),
  });

  const restoreMutation = useMutation({
    mutationFn: restorePriceGroup,
    onSuccess: (restoredGroup) => {
      toast.success("Grupo de precio restaurado");
      setPriceGroups(prev => prev.map(pg => pg.id === restoredGroup.id ? restoredGroup : pg).filter(pg => showDeleted ? true : !pg.deleted_at));
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filteredPriceGroups = priceGroups.filter(pg => 
    showDeleted ? true : !pg.deleted_at
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">Grupos de Precios</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowDeleted(!showDeleted)}>
            {showDeleted ? "Ocultar Eliminados" : "Mostrar Eliminados"}
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Crear Grupo</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo Grupo de Precios</DialogTitle>
              </DialogHeader>
              <PriceGroupForm
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
            <th className="text-left p-2">Precio</th>
            <th className="text-left p-2">Estado</th>
            <th className="text-left p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && initialPriceGroups.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-2 text-center">Cargando...</td>
            </tr>
          ) : filteredPriceGroups.length === 0 ? (
             <tr>
              <td colSpan={4} className="p-2 text-center">No hay grupos de precios para mostrar.</td>
            </tr>
          ) : (
            filteredPriceGroups.map((pg) => (
              <tr key={pg.id} className={pg.deleted_at ? "bg-red-100 line-through" : ""}>
                <td className="p-2">{pg.name}</td>
                <td className="p-2">${Number(pg.price).toFixed(2)}</td>
                <td className="p-2">
                  {pg.deleted_at ? "Eliminado" : "Activo"}
                </td>
                <td className="p-2 space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditGroup(pg)}
                    disabled={!!pg.deleted_at}
                  >
                    Editar
                  </Button>
                  {!pg.deleted_at ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">Eliminar</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción marcará el grupo como eliminado. Podrás restaurarlo más tarde.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate(pg.id)}>
                            Confirmar Eliminación
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => restoreMutation.mutate(pg.id)}
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
        open={!!editGroup}
        onOpenChange={(openState) => !openState && setEditGroup(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Grupo de Precios</DialogTitle>
          </DialogHeader>
          {editGroup && (
            <PriceGroupForm
              defaultValues={editGroup}
              onSubmit={(data) => {
                if (editGroup?.id) {
                  updateMutation.mutate({ id: editGroup.id, payload: data });
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
