"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-lg bg-gray-900 p-8 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-900/20">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="mb-2 text-2xl font-bold text-white">Mensaje Enviado</h3>
        <p className="mb-6 text-gray-400">
          Gracias por contactarnos. Nuestro equipo te responderá a la brevedad
          posible.
        </p>
        <Button
          className="bg-gold-500 text-black hover:bg-gold-600"
          onClick={() => setIsSubmitted(false)}
        >
          Enviar otro mensaje
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-gray-900 p-6 md:p-8">
      <h2 className="mb-6 font-serif text-2xl font-bold text-white">
        Envíanos un Mensaje
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-white">
              Nombre
            </label>
            <Input
              id="name"
              placeholder="Tu nombre"
              required
              className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-gold-500"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-white">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              required
              className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-gold-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="subject" className="text-sm font-medium text-white">
            Asunto
          </label>
          <Select>
            <SelectTrigger className="border-gray-700 bg-gray-800 text-white focus:border-gold-500 focus:ring-gold-500/20">
              <SelectValue placeholder="Selecciona un asunto" />
            </SelectTrigger>
            <SelectContent className="border-gray-700 bg-gray-900 text-white">
              <SelectItem value="general">Consulta General</SelectItem>
              <SelectItem value="products">Información de Productos</SelectItem>
              <SelectItem value="orders">Pedidos y Envíos</SelectItem>
              <SelectItem value="wholesale">Ventas al por Mayor</SelectItem>
              <SelectItem value="events">Eventos Privados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium text-white">
            Mensaje
          </label>
          <Textarea
            id="message"
            placeholder="¿En qué podemos ayudarte?"
            rows={5}
            required
            className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-gold-500"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-gold-500 text-black hover:bg-gold-600"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
        </Button>
      </form>
    </div>
  );
}
