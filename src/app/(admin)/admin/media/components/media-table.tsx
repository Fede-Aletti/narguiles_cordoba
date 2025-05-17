// src/app/admin/media/media-table.tsx
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { MediaForm } from "./media-form";
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
import { createMedia, updateMedia } from "@/actions/media-actions";
import { fetchMedia } from "@/actions/media-actions";

export function MediaTable() {
  const queryClient = useQueryClient();
  const { data: media = [], isLoading } = useQuery({
    queryKey: ["media"],
    queryFn: fetchMedia,
  });
  const [open, setOpen] = useState(false);
  const [editMedia, setEditMedia] = useState<{
    id: number;
    url: string;
    alt?: string;
  } | null>(null);

  const createMutation = useMutation({
    mutationFn: createMedia,
    onSuccess: () => {
      toast.success("Media creada");
      queryClient.invalidateQueries({ queryKey: ["media"] });
      setOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: updateMedia,
    onSuccess: () => {
      toast.success("Media actualizada");
      queryClient.invalidateQueries({ queryKey: ["media"] });
      setEditMedia(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">Media</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Crear Media</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Media</DialogTitle>
            </DialogHeader>
            <MediaForm
              onSubmit={(data) => createMutation.mutate(data)}
              loading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
      <table className="min-w-full border mt-2">
        <thead>
          <tr>
            <th className="text-left p-2">URL</th>
            <th className="text-left p-2">Alt</th>
            <th className="text-left p-2">Vista</th>
            <th className="text-left p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={4}>Cargando...</td>
            </tr>
          ) : (
            media.map((m) => (
              <tr key={m.id}>
                <td className="p-2">{m.url}</td>
                <td className="p-2">{m.alt}</td>
                <td className="p-2">
                  {/* Si es imagen, mostrar preview */}
                  {m.url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                    <img
                      src={m.url}
                      alt={m.alt}
                      className="h-12 w-auto rounded"
                    />
                  ) : (
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Ver archivo
                    </a>
                  )}
                </td>
                <td className="p-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditMedia(m)}
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
        open={!!editMedia}
        onOpenChange={(open) => !open && setEditMedia(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Media</DialogTitle>
          </DialogHeader>
          <MediaForm
            defaultValues={editMedia ?? undefined}
            onSubmit={(data) =>
              updateMutation.mutate({ id: editMedia!.id, ...data })
            }
            loading={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
