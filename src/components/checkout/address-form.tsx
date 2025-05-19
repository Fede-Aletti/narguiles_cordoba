"use client"; // Ensure it's a client component

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateAddress } from "@/lib/queries/address-queries"; // Use the hook
import { toast } from "sonner";

// The form fields match Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>
interface AddressFormData {
  street: string;
  street_number: string;
  province: string;
  city: string;
  postal_code: string;
  phone_number: string;
}

export function AddressForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState<AddressFormData>({
    street: "",
    street_number: "",
    province: "",
    city: "",
    postal_code: "",
    phone_number: "",
  });
  
  const { mutateAsync: createAddress, status } = useCreateAddress();
  const isLoading = status === 'pending';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAddress(form);
      toast.success("Dirección guardada exitosamente!");
      onSuccess(); // Call onSuccess to, for example, hide the form
      // Optionally reset form fields
      setForm({
        street: "", street_number: "", province: "", city: "",
        postal_code: "", phone_number: "",
      });
    } catch (err: any) {
      toast.error(err.message || "Error al guardar la dirección");
    }
  };

  return (
    <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
      <Input
        name="street"
        placeholder="Calle"
        value={form.street}
        onChange={handleChange}
        required
        className="bg-gray-800 border-gray-700 focus:border-gold-400 text-white"
      />
      <Input
        name="street_number"
        placeholder="Número"
        value={form.street_number}
        onChange={handleChange}
        required
        className="bg-gray-800 border-gray-700 focus:border-gold-400 text-white"
      />
      <Input
        name="province"
        placeholder="Provincia"
        value={form.province}
        onChange={handleChange}
        required
        className="bg-gray-800 border-gray-700 focus:border-gold-400 text-white"
      />
      <Input
        name="city"
        placeholder="Ciudad"
        value={form.city}
        onChange={handleChange}
        required
        className="bg-gray-800 border-gray-700 focus:border-gold-400 text-white"
      />
      <Input
        name="postal_code"
        placeholder="Código Postal"
        value={form.postal_code}
        onChange={handleChange}
        required
        className="bg-gray-800 border-gray-700 focus:border-gold-400 text-white"
      />
      <Input
        name="phone_number"
        placeholder="Teléfono"
        value={form.phone_number}
        onChange={handleChange}
        required
        className="bg-gray-800 border-gray-700 focus:border-gold-400 text-white"
      />
      <Button
        type="submit"
        className="w-full bg-gold-500 hover:bg-gold-600 text-black"
        disabled={isLoading}
      >
        {isLoading ? "Guardando..." : "Guardar dirección"}
      </Button>
    </form>
  );
}
