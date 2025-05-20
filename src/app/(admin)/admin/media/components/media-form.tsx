// src/app/admin/media/components/media-form.tsx
"use client";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import type { IMediaFolder } from "@/interfaces/media";

const mediaFormSchema = z.object({
  url: z.string().url("Debe ser una URL válida"),
  name: z.string().min(1, "El nombre es requerido"),
  tags: z.string().optional(),
  folder_id: z.string().nullable().optional(),
});

export type MediaFormData = z.infer<typeof mediaFormSchema>;

export function MediaForm({
  onSubmit,
  defaultValues,
  loading,
  availableFolders,
  currentFolderIdForForm,
}: {
  onSubmit: (data: MediaFormData) => void;
  defaultValues?: Partial<MediaFormData>;
  loading?: boolean;
  availableFolders: IMediaFolder[];
  currentFolderIdForForm?: string | null;
}) {
  const form = useForm<MediaFormData>({
    resolver: zodResolver(mediaFormSchema),
    defaultValues: {
      ...defaultValues,
      folder_id: defaultValues?.folder_id || currentFolderIdForForm || null,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL del archivo</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://example.com/image.png" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ej: Logo de la empresa" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="folder_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Carpeta</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar carpeta (opcional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="null">Raíz (sin carpeta)</SelectItem>
                  {availableFolders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (separados por comas)</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Ej: logo, oscuro, vector" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Guardando..." : "Guardar Media Item"}
        </Button>
      </form>
    </Form>
  );
}
