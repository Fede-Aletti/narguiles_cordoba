// src/app/admin/catalogo/brand-form.tsx
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

const brandFormSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  description: z.string().optional().nullable(),
  image_id: z.string().uuid("Debe ser un UUID válido.").optional().nullable(),
});

export type BrandFormValues = z.infer<typeof brandFormSchema>;

interface BrandFormProps {
  onSubmit: (data: BrandFormValues) => void;
  defaultValues?: Partial<BrandFormValues>;
  loading?: boolean;
}

export function BrandForm({
  onSubmit,
  defaultValues,
  loading,
}: BrandFormProps) {
  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: defaultValues || { name: "", description: null, image_id: null },
  });

  const handleSubmit = (values: BrandFormValues) => {
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
                <Input {...field} placeholder="Nombre de la marca" />
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
                  placeholder="Descripción de la marca"
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
