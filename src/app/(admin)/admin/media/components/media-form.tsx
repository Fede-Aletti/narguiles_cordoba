// src/app/admin/media/media-form.tsx
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
  url: z.string().url("Debe ser una URL válida"),
  alt: z.string().optional(),
});

export function MediaForm({
  onSubmit,
  defaultValues,
  loading,
}: {
  onSubmit: (data: { url: string; alt?: string }) => void;
  defaultValues?: { url: string; alt?: string };
  loading?: boolean;
}) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || { url: "", alt: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="alt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto alternativo (alt)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Descripción de la imagen" />
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
