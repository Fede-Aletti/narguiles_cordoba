"use client"
import { AddressesList } from '@/components/checkout/addresses-list';
import { CartSummary } from '@/components/checkout/cart-summary';
import { useUserAddresses } from '@/lib/queries/address-queries';
import { useStore } from '@/lib/store';

import { useState } from 'react';

export default function CheckoutPage() {
  const { cartItems } = useStore();
  const { data: addresses, isLoading } = useUserAddresses();
  // const { addresses, isLoading } = useUserAddresses();
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-black pt-24 pb-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Addresses */}
        <div>
          <AddressesList
            addresses={addresses || []}
            isLoading={isLoading}
            selectedAddressId={selectedAddressId}
            onSelect={setSelectedAddressId}
          />
        </div>
        {/* Cart Summary */}
        <div>
          <CartSummary cartItems={cartItems} selectedAddressId={selectedAddressId} />
        </div>
      </div>
    </div>
  );
} 