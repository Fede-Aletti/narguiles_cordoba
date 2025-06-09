"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import Image from "next/image";
import { LOGO_URL } from "@/lib/constants";

interface AgeVerificationModalProps {
  onConfirm: () => void;
  isOpen: boolean;
}

export function AgeVerificationModal({
  onConfirm,
  isOpen,
}: AgeVerificationModalProps) {
  const handleConfirm = () => {
    // Guardar en sessionStorage que ya se verificó la edad
    sessionStorage.setItem("age_verified", "true");
    onConfirm();
  };

  const handleReject = () => {
    // Redirigir a una página externa o mostrar mensaje
    window.location.href = "https://www.google.com";
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="bg-white border-0 text-gray-900 max-w-lg mx-auto shadow-2xl rounded-3xl overflow-hidden [&>button]:hidden">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-red-400 rounded-2xl p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
              <Image
                src={LOGO_URL}
                alt="Logo"
                width={80}
                height={80}
                className="rounded-full"
              />
            </div>
          </div>
          <DialogTitle className="text-3xl font-serif font-bold text-white">
            Verificación de Edad
          </DialogTitle>
          <p className="text-white/90 text-sm mt-2 font-medium">
            Contenido exclusivo para mayores de 18 años
          </p>
        </div>

        {/* Contenido principal */}
        <div className="p-8 text-center space-y-6 bg-white">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">
              Sos mayor de 18 años?
            </h3>
            <p className="text-gray-600 text-base leading-relaxed max-w-sm mx-auto">
              Nuestros productos de narguila están destinados únicamente para
              adultos mayores de edad según la legislación vigente.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6">
            <Button
              onClick={handleReject}
              variant="outline"
              className="border-2 border-gray-300 text-white hover:bg-gray-900 hover:border-gray-400 font-semibold py-3 text-base transition-all duration-200"
            >
              No, soy menor
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Sí, soy mayor
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Al continuar, confirmas que tienes al menos 18 años de edad y
              aceptas acceder a contenido para adultos.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
