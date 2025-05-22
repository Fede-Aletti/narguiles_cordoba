"use client";

import { useState } from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrderStatus, ORDER_STATUS_VALUES } from "@/interfaces/enums";
import { updateOrderStatus } from "@/lib/actions/order-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface OrderStatusUpdateProps {
  orderId: string;
  currentStatus: OrderStatus;
  onStatusUpdate?: () => void;
  size?: "default" | "sm";
}

// Mapeo de estados de orden a etiquetas en español
const statusDisplayNames: Record<OrderStatus, string> = {
  [OrderStatus.IN_CART]: "En Carrito",
  [OrderStatus.PLACED]: "Realizada",
  [OrderStatus.CONFIRMED]: "Confirmada",
  [OrderStatus.PROCESSED]: "Procesando",
  [OrderStatus.PICKUP]: "Lista para Retiro",
  [OrderStatus.SHIPPED]: "Enviada",
  [OrderStatus.DELIVERED]: "Entregada"
};

// Mapeo de estados a colores/variantes con mejor contraste
const statusColors: Record<OrderStatus, { bg: string, text: string, icon: string, menuItem: string }> = {
  [OrderStatus.IN_CART]: { 
    bg: "bg-gray-200", 
    text: "text-gray-900",
    icon: "🛒",
    menuItem: "bg-gray-100 text-gray-900"
  },
  [OrderStatus.PLACED]: { 
    bg: "bg-blue-200", 
    text: "text-blue-900",
    icon: "📝",
    menuItem: "bg-blue-100 text-blue-900"
  },
  [OrderStatus.CONFIRMED]: { 
    bg: "bg-amber-200", 
    text: "text-amber-900",
    icon: "✅",
    menuItem: "bg-amber-100 text-amber-900"
  },
  [OrderStatus.PROCESSED]: { 
    bg: "bg-purple-200", 
    text: "text-purple-900",
    icon: "⚙️",
    menuItem: "bg-purple-100 text-purple-900"
  },
  [OrderStatus.PICKUP]: { 
    bg: "bg-yellow-200", 
    text: "text-yellow-900",
    icon: "🏪",
    menuItem: "bg-yellow-100 text-yellow-900"
  },
  [OrderStatus.SHIPPED]: { 
    bg: "bg-indigo-200", 
    text: "text-indigo-900",
    icon: "🚚",
    menuItem: "bg-indigo-100 text-indigo-900"
  },
  [OrderStatus.DELIVERED]: { 
    bg: "bg-green-200", 
    text: "text-green-900",
    icon: "📦",
    menuItem: "bg-green-100 text-green-900"
  }
};

export function OrderStatusUpdate({ 
  orderId, 
  currentStatus, 
  onStatusUpdate, 
  size = "default"
}: OrderStatusUpdateProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Estado actualizado a "${statusDisplayNames[newStatus]}"`);
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      toast.error(`Error al actualizar estado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size={size} 
          className={cn(
            "w-full md:w-auto justify-between border-2",
            statusColors[currentStatus].bg,
            statusColors[currentStatus].text,
            "border-transparent hover:border-gray-300 transition-colors shadow-sm"
          )}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <>
              <span className="flex items-center">
                <span className="mr-1.5">{statusColors[currentStatus].icon}</span>
                <span className="font-medium">{statusDisplayNames[currentStatus]}</span>
              </span>
              <ChevronDown className="h-4 w-4 ml-1 opacity-70" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-1 border border-gray-300 shadow-lg">
        <DropdownMenuLabel className="font-bold px-3 py-2">Cambiar estado</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200" />
        {ORDER_STATUS_VALUES.map((status) => (
          <DropdownMenuItem
            key={status}
            className={cn(
              "flex items-center gap-2 px-3 py-2 my-1 rounded-md cursor-pointer transition-colors",
              status === currentStatus 
                ? statusColors[status].menuItem
                : "hover:bg-gray-100"
            )}
            onClick={() => handleStatusChange(status)}
          >
            <span className="text-base">{statusColors[status].icon}</span>
            <span className="flex-grow font-medium">{statusDisplayNames[status]}</span>
            {status === currentStatus && (
              <Check className="h-4 w-4 text-green-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 