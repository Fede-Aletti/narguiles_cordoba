"use client"
import { AddressesList } from '@/components/checkout/addresses-list';
import { CartSummary } from '@/components/checkout/cart-summary';
import { useUserAddresses } from '@/lib/queries/address-queries';
import { useStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const { cartItems } = useStore();
  const { data: addresses, isLoading: addressesLoading } = useUserAddresses();
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Debes iniciar sesión primero para acceder al checkout.");
        router.push('/tienda');
      } else {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

  if (isCheckingAuth || addressesLoading) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-8 flex items-center justify-center">
        <p className="text-white text-xl">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Addresses */}
        <div>
          <AddressesList
            addresses={addresses || []}
            isLoading={addressesLoading}
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