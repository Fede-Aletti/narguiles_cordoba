// src/app/admin/catalogo/category-form.tsx
"use client";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";

const categoryFormSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  description: z.string().optional().nullable(),
  image_id: z.string().uuid("Debe ser un UUID válido.").optional().nullable(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  onSubmit: (data: CategoryFormValues) => void;
  defaultValues?: Partial<CategoryFormValues>;
  loading?: boolean;
}

export function CategoryForm({
  onSubmit,
  defaultValues,
  loading,
}: CategoryFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: defaultValues || { name: "", description: null, image_id: null },
  });

  const handleSubmit = (values: CategoryFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nombre de la categoría" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Descripción de la categoría"
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID de Imagen (Opcional, UUID)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} placeholder="ID de la imagen (UUID)" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Guardando..." : "Guardar"}
        </Button>
      </form>
    </Form>
  );
}
