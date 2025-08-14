"use client";

import { useState } from "react";
import { useUserAddresses, useCreateAddress, useUpdateAddress, useDeleteAddress } from "@/lib/queries/address-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddressForm } from "@/components/checkout/address-form";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export function AddressesSection() {
  const { data: addresses, isLoading } = useUserAddresses();
  const { mutateAsync: updateAddress } = useUpdateAddress();
  const { mutateAsync: deleteAddress } = useDeleteAddress();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [localEdits, setLocalEdits] = useState<Record<string, any>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleStartEdit = (id: string) => {
    setEditingId(id);
    const current = addresses?.find(a => a.id === id);
    setLocalEdits(prev => ({ ...prev, [id]: { ...current } }));
  };

  const handleChange = (id: string, field: string, value: string) => {
    setLocalEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleSave = async (id: string) => {
    const { street, street_number, province, city, postal_code, phone_number } = localEdits[id] || {};
    try {
      await updateAddress({ id, payload: { street, street_number, province, city, postal_code, phone_number } });
      toast.success("Dirección actualizada");
      setEditingId(null);
    } catch (e: any) {
      toast.error(e?.message || "No se pudo actualizar");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAddress({ id });
      toast.success("Dirección eliminada");
      if (editingId === id) setEditingId(null);
    } catch (e: any) {
      toast.error(e?.message || "No se pudo eliminar");
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-xl text-white">Mis direcciones</h3>
        <Button className="bg-gold-500 hover:bg-gold-600 text-black" onClick={() => setShowCreateForm(v => !v)}>
          {showCreateForm ? "Cerrar" : "+ Agregar dirección"}
        </Button>
      </div>

      {showCreateForm && (
        <div className="mb-6">
          <AddressForm onSuccess={() => setShowCreateForm(false)} />
        </div>
      )}

      {isLoading ? (
        <div className="text-gray-400">Cargando...</div>
      ) : !addresses || addresses.length === 0 ? (
        <div className="text-gray-400">No tienes direcciones guardadas.</div>
      ) : (
        <div className="space-y-4">
          {addresses.map(addr => {
            const isEditing = editingId === addr.id;
            const values = isEditing ? localEdits[addr.id] : addr;
            return (
              <div key={addr.id} className="p-4 rounded border border-gray-800 bg-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-gray-400">Calle</label>
                    <Input disabled={!isEditing} value={values?.street || ""} onChange={e => handleChange(addr.id, "street", e.target.value)} className="bg-gray-900 border-gray-700 text-white" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Número</label>
                    <Input disabled={!isEditing} value={values?.street_number || ""} onChange={e => handleChange(addr.id, "street_number", e.target.value)} className="bg-gray-900 border-gray-700 text-white" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Ciudad</label>
                    <Input disabled={!isEditing} value={values?.city || ""} onChange={e => handleChange(addr.id, "city", e.target.value)} className="bg-gray-900 border-gray-700 text-white" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Provincia</label>
                    <Input disabled={!isEditing} value={values?.province || ""} onChange={e => handleChange(addr.id, "province", e.target.value)} className="bg-gray-900 border-gray-700 text-white" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Código Postal</label>
                    <Input disabled={!isEditing} value={values?.postal_code || ""} onChange={e => handleChange(addr.id, "postal_code", e.target.value)} className="bg-gray-900 border-gray-700 text-white" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Teléfono</label>
                    <Input disabled={!isEditing} value={values?.phone_number || ""} onChange={e => handleChange(addr.id, "phone_number", e.target.value)} className="bg-gray-900 border-gray-700 text-white" />
                  </div>
                </div>
                <div className="flex gap-3 justify-end mt-4">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={() => setEditingId(null)}>Cancelar</Button>
                      <Button className="bg-gold-500 hover:bg-gold-600 text-black" onClick={() => handleSave(addr.id)}>Guardar</Button>
                    </>
                  ) : (
                    <>
                      <Button variant="secondary" onClick={() => handleStartEdit(addr.id)}>Editar</Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">Eliminar</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Eliminar dirección</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. La dirección será eliminada de tu cuenta.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(addr.id)}>Eliminar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
