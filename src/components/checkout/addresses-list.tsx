import { useState } from 'react';
import { Address } from '@/interfaces/address';
import { Button } from '@/components/ui/button';
import { AddressForm } from './address-form';


interface AddressesListProps {
  addresses: Address[];
  isLoading: boolean;
  selectedAddressId: number | null;
  onSelect: (id: number) => void;
}

export function AddressesList({ addresses, isLoading, selectedAddressId, onSelect }: AddressesListProps) {
  const [showForm, setShowForm] = useState(false);

  if (isLoading) return <div className="text-gray-400">Cargando direcciones...</div>;

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">Direcciones de envío</h2>
      {addresses.length === 0 && !showForm && (
        <div className="text-gray-400 mb-4">No tienes direcciones guardadas.</div>
      )}
      <div className="space-y-4 mb-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`p-4 rounded border cursor-pointer ${selectedAddressId === address.id ? 'border-gold-500 bg-gold-500/10' : 'border-gray-700 bg-gray-800'} text-white`}
            onClick={() => onSelect(address.id)}
            tabIndex={0}
            aria-label={`Seleccionar dirección ${address.street} ${address.street_number}`}
          >
            <div className="font-medium">{address.street} {address.street_number}, {address.city}</div>
            <div className="text-sm text-gray-400">{address.province}, CP {address.postal_code}</div>
            <div className="text-sm text-gray-400">Tel: {address.phone_number}</div>
          </div>
        ))}
      </div>
      {showForm ? (
        <AddressForm onSuccess={() => setShowForm(false)} />
      ) : (
        <Button className="w-full bg-gold-500 hover:bg-gold-600 text-black" onClick={() => setShowForm(true)}>
          + Agregar dirección
        </Button>
      )}
    </div>
  );
} 