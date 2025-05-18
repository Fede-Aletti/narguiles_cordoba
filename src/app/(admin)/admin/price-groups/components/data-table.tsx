// src/app/admin/price-groups/price-group-table.tsx
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PriceGroupForm } from "./price-group-form";
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
import {
  fetchPriceGroups,
  createPriceGroup,
  updatePriceGroup,
} from "@/actions/price-group-actions";

export function PriceGroupTable() {
  const queryClient = useQueryClient();
  const { data: priceGroups = [], isLoading } = useQuery({
    queryKey: ["priceGroups"],
    queryFn: fetchPriceGroups,
  });
  const [open, setOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<{
    id: number;
    name: string;
    price: number;
  } | null>(null);

  const createMutation = useMutation({
    mutationFn: createPriceGroup,
    onSuccess: () => {
      toast.success("Grupo de precio creado");
      queryClient.invalidateQueries({ queryKey: ["priceGroups"] });
      setOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: updatePriceGroup,
    onSuccess: () => {
      toast.success("Grupo de precio actualizado");
      queryClient.invalidateQueries({ queryKey: ["priceGroups"] });
      setEditGroup(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">Grupos de Precios</h2>
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
      <table className="min-w-full border mt-2">
        <thead>
          <tr>
            <th className="text-left p-2">Nombre</th>
            <th className="text-left p-2">Precio</th>
            <th className="text-left p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={3}>Cargando...</td>
            </tr>
          ) : (
            priceGroups.map((pg) => (
              <tr key={pg.id}>
                <td className="p-2">{pg.name}</td>
                <td className="p-2">${Number(pg.price).toFixed(2)}</td>
                <td className="p-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditGroup(pg)}
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
        open={!!editGroup}
        onOpenChange={(open) => !open && setEditGroup(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Grupo de Precios</DialogTitle>
          </DialogHeader>
          <PriceGroupForm
            defaultValues={editGroup ?? undefined}
            onSubmit={(data) =>
              updateMutation.mutate({ id: editGroup!.id, ...data })
            }
            loading={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
