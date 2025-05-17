// src/app/admin/catalogo/category-form.tsx
"use client";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

const schema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
});

export function CategoryForm({
  onSubmit,
  defaultValues,
  loading,
}: {
  onSubmit: (data: { name: string }) => void;
  defaultValues?: { name: string };
  loading?: boolean;
}) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || { name: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Guardando..." : "Guardar"}
        </Button>
      </form>
    </Form>
  );
}
