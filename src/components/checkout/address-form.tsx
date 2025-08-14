"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { useCreateAddress } from "@/lib/queries/address-queries";
import { toast } from "sonner";

const addressSchema = z.object({
  street: z
    .string()
    .trim()
    .min(2, { message: "La calle es requerida" })
    .max(100, { message: "Máximo 100 caracteres" }),
  street_number: z
    .string()
    .trim()
    .min(1, { message: "El número es requerido" })
    .max(10, { message: "Máximo 10 caracteres" })
    .regex(/^[a-zA-Z0-9\-\/]+$/, {
      message: "Sólo letras, números y -/",
    }),
  province: z
    .string()
    .trim()
    .min(2, { message: "La provincia es requerida" })
    .max(50, { message: "Máximo 50 caracteres" }),
  city: z
    .string()
    .trim()
    .min(2, { message: "La ciudad es requerida" })
    .max(50, { message: "Máximo 50 caracteres" }),
  postal_code: z
    .string()
    .trim()
    .min(4, { message: "Código postal inválido" })
    .max(10, { message: "Código postal inválido" })
    .regex(/^\d{4,10}$/, { message: "Use sólo números (4-10)" }),
  phone_number: z
    .string()
    .trim()
    .min(6, { message: "Teléfono inválido" })
    .max(20, { message: "Teléfono demasiado largo" })
    .regex(/^[+]?[-()\s\d]{6,20}$/, {
      message: "Formato: dígitos, espacios, +, -, ( )",
    }),
});

type AddressFormData = z.infer<typeof addressSchema>;

export function AddressForm({ onSuccess }: { onSuccess: () => void }) {
  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: "",
      street_number: "",
      province: "",
      city: "",
      postal_code: "",
      phone_number: "",
    },
    mode: "onBlur",
  });

  const { mutateAsync: createAddress, status } = useCreateAddress();
  const isLoading = status === "pending";

  const numericInputProps = useMemo(
    () => ({ inputMode: "numeric" as const, pattern: "[0-9]*" }),
    []
  );

  async function onSubmit(values: AddressFormData) {
    try {
      const payload = Object.fromEntries(
        Object.entries(values).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])
      ) as AddressFormData;
      await createAddress(payload);
      toast.success("Dirección guardada exitosamente!");
      onSuccess();
      form.reset();
    } catch (err: any) {
      toast.error(err?.message || "Error al guardar la dirección");
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-4 mt-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="street"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Calle</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Calle"
                  className="bg-gray-800 border-gray-700 focus:border-gold-400 text-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="street_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Número"
                  className="bg-gray-800 border-gray-700 focus:border-gold-400 text-white"
                  maxLength={10}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="province"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provincia</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Provincia"
                  className="bg-gray-800 border-gray-700 focus:border-gold-400 text-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ciudad</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ciudad"
                  className="bg-gray-800 border-gray-700 focus:border-gold-400 text-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="postal_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código Postal</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Código Postal"
                  className="bg-gray-800 border-gray-700 focus:border-gold-400 text-white"
                  {...numericInputProps}
                  maxLength={10}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Teléfono"
                  className="bg-gray-800 border-gray-700 focus:border-gold-400 text-white"
                  maxLength={20}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-gold-500 hover:bg-gold-600 text-black"
          disabled={isLoading}
        >
          {isLoading ? "Guardando..." : "Guardar dirección"}
        </Button>
      </form>
    </Form>
  );
}
