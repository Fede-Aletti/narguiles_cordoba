"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";
import { updateUserProfile } from "./actions";

const userProfileSchema = z.object({
  first_name: z.string().min(1, { message: "El nombre es obligatorio" }),
  last_name: z.string().min(1, { message: "El apellido es obligatorio" }),
  phone_number: z.string().optional(),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"], {
    invalid_type_error: "Por favor selecciona una opción",
  }).optional(),
});

type UserProfileFormValues = z.infer<typeof userProfileSchema>;

type UserData = {
  id?: number;
  first_name?: string | null;
  last_name?: string | null;
  phone_number?: string | null;
  gender?: string | null;
};

export function UserProfileForm({ userData, userId }: { userData?: UserData, userId?: number }) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      first_name: userData?.first_name || "",
      last_name: userData?.last_name || "",
      phone_number: userData?.phone_number || "",
      gender: (userData?.gender as any) || undefined,
    },
  });

  const onSubmit = async (data: UserProfileFormValues) => {
    if (!userId) {
      toast.error("Error al actualizar el perfil: ID de usuario no disponible");
      return;
    }

    setIsPending(true);
    try {
      const result = await updateUserProfile(userId, data);
      if (result.success) {
        toast.success("Perfil actualizado correctamente");
      } else {
        toast.error(`Error al actualizar el perfil: ${result.error}`);
      }
    } catch (error) {
      toast.error(`Error al actualizar el perfil: ${error instanceof Error ? error.message : "Error desconocido"}`);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido</FormLabel>
                <FormControl>
                  <Input placeholder="Apellido" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input placeholder="Teléfono" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Género</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu género" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Femenino</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefiero no decirlo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </form>
    </Form>
  );
} 