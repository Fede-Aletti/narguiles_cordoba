"use client";

import { MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WhatsAppFloat() {
  const handleWhatsAppClick = () => {
    // Número principal (Ari)
    const phoneNumber = "5493513153203";
    const message = "¡Hola! Me interesa conocer más sobre sus productos de narguila.";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 size-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
      size="icon"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="size-10" />
    </Button>
  );
} 