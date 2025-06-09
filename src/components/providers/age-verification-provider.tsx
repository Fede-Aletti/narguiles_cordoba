"use client";

import { useAgeVerification } from "@/hooks/use-age-verification";
import { AgeVerificationModal } from "@/components/modals/age-verification-modal";

interface AgeVerificationProviderProps {
  children: React.ReactNode;
}

export function AgeVerificationProvider({
  children,
}: AgeVerificationProviderProps) {
  const { showModal, isLoading, handleConfirm } = useAgeVerification();

  // No renderizar el modal ni los children hasta que termine de cargar
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {children}
      <AgeVerificationModal isOpen={showModal} onConfirm={handleConfirm} />
    </>
  );
}
