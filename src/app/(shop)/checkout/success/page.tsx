"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black pt-24">
      <CheckCircle className="h-16 w-16 text-green-500 mb-6" />
      <h1 className="text-3xl font-bold text-white mb-2">¡Gracias por tu compra!</h1>
      <p className="text-lg text-gray-300 mb-4">
        Tu pedido ha sido registrado correctamente.
      </p>
      {orderId && (
        <div className="mb-4 text-gold-400 text-lg">
          Número de orden: <span className="font-mono">{orderId}</span>
        </div>
      )}
      <Link href="/tienda">
        <Button className="bg-gold-500 hover:bg-gold-600 text-black">Volver a la tienda</Button>
      </Link>
    </div>
  );
}
