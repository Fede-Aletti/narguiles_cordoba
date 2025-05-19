import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { createClient } from "@/utils/supabase/client";
import { createAddress } from "@/lib/queries/address-queries";

export function AddressForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    street: "",
    street_number: "",
    province: "",
    city: "",
    postal_code: "",
    phone_number: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  // Obtener el user_id del usuario autenticado
  useEffect(() => {
    const fetchUserId = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: userProfile } = await supabase
        .from("user")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();
      setUserId(userProfile?.id ?? null);
    };
    fetchUserId();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!userId) throw new Error("No se pudo obtener el usuario");
      await createAddress({ ...form, user_id: userId });
      onSuccess();
    } catch (err: any) {
      setError("Error al guardar la dirección");
    } finally {
      setLoading(false);
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
      />
      <Input
        name="street_number"
        placeholder="Número"
        value={form.street_number}
        onChange={handleChange}
        required
      />
      <Input
        name="province"
        placeholder="Provincia"
        value={form.province}
        onChange={handleChange}
        required
      />
      <Input
        name="city"
        placeholder="Ciudad"
        value={form.city}
        onChange={handleChange}
        required
      />
      <Input
        name="postal_code"
        placeholder="Código Postal"
        value={form.postal_code}
        onChange={handleChange}
        required
      />
      <Input
        name="phone_number"
        placeholder="Teléfono"
        value={form.phone_number}
        onChange={handleChange}
        required
      />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <Button
        type="submit"
        className="w-full bg-gold-500 hover:bg-gold-600 text-black"
        disabled={loading || !userId}
      >
        {loading ? "Guardando..." : "Guardar dirección"}
      </Button>
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </form>
  );
}
