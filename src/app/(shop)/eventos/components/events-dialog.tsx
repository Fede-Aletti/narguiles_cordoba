"use client";

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface EventInquiryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  guestCount: string;
  eventDate: string;
  message: string;
}

export const EventInquiryDialog = ({
  isOpen,
  onClose,
  phoneNumber,
}: EventInquiryDialogProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    eventType: "",
    guestCount: "",
    eventDate: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const { name, email, phone, eventType, guestCount, eventDate, message } =
      formData;

    let whatsappMessage = `Hola Luxury Hookah,\n\nEstoy interesado/a en su servicio de catering de narguilas para un evento. A continuación, los detalles:\n\n`;
    whatsappMessage += `*Nombre:* ${name}\n`;
    whatsappMessage += `*Email:* ${email}\n`;
    if (phone) whatsappMessage += `*Teléfono:* ${phone}\n`;
    whatsappMessage += `*Tipo de Evento:* ${eventType}\n`;
    if (guestCount)
      whatsappMessage += `*Cantidad de Invitados (aprox.):* ${guestCount}\n`;
    if (eventDate) whatsappMessage += `*Fecha del Evento:* ${eventDate}\n`;
    whatsappMessage += `*Mensaje Adicional:*\n${message || "Sin mensaje adicional."}\n\n`;
    whatsappMessage += `Espero su contacto para más información.\n¡Gracias!`;

    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
    onClose();
  };

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === "Enter" || event.key === " ") {
      action();
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(openStatus) => !openStatus && onClose()}>
      <DialogContent className="max-w-lg overflow-y-auto bg-gray-900 text-white sm:max-h-[90vh]">
        <DialogHeader className="border-b border-gray-700 p-6">
          <DialogTitle className="font-serif text-2xl font-bold text-white">
            Solicitar Presupuesto
          </DialogTitle>
          {/* <DialogClose
            className="absolute right-4 top-4 rounded-sm p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-gray-900 data-[state=open]:bg-gray-700"
            onClick={onClose}
            aria-label="Cerrar diálogo"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-white" />
          </DialogClose> */}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gold-400">
              Nombre Completo
            </Label>
            <Input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-gold-500 focus:ring-gold-500"
              placeholder="Tu nombre completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gold-400">
              Email
            </Label>
            <Input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-gold-500 focus:ring-gold-500"
              placeholder="tu@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gold-400">
              Teléfono (Opcional)
            </Label>
            <Input
              type="tel"
              name="phone"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              className="rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-gold-500 focus:ring-gold-500"
              placeholder="Ej: +54 9 351 1234567"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="eventType"
              className="text-sm font-medium text-gold-400"
            >
              Tipo de Evento
            </Label>
            <Input
              type="text"
              name="eventType"
              id="eventType"
              value={formData.eventType}
              onChange={handleChange}
              required
              className="rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-gold-500 focus:ring-gold-500"
              placeholder="Ej: Boda, Fiesta Privada, Evento Corporativo"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="guestCount"
              className="text-sm font-medium text-gold-400"
            >
              Número de Invitados (aprox.)
            </Label>
            <Input
              type="number"
              name="guestCount"
              id="guestCount"
              value={formData.guestCount}
              onChange={handleChange}
              min="1"
              className="rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-gold-500 focus:ring-gold-500"
              placeholder="Ej: 50"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="eventDate"
              className="text-sm font-medium text-gold-400"
            >
              Fecha del Evento (Opcional)
            </Label>
            <Input
              type="date"
              name="eventDate"
              id="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              className="rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-gold-500 focus:ring-gold-500"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="message"
              className="text-sm font-medium text-gold-400"
            >
              Mensaje Adicional
            </Label>
            <Textarea
              name="message"
              id="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              placeholder="Cuéntanos más sobre tu evento, preferencias de sabores, cantidad de narguilas, etc."
              className="rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-gold-500 focus:ring-gold-500"
            />
          </div>

          <DialogFooter className="border-t border-gray-700 p-6">
            <Button
              type="submit"
              className="w-full rounded-md border border-transparent bg-gold-500 px-4 py-2 text-base font-medium text-black shadow-sm hover:bg-gold-600 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Enviar por WhatsApp
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
