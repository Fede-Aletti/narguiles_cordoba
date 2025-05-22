"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStatus, ORDER_STATUS_VALUES } from "@/interfaces/enums";
import { useState } from "react";

interface OrderStatusFilterProps {
  onFilterChange: (status: OrderStatus | null) => void;
  statusCounts: Record<string, number>;
}

// Mapeo de estados de orden a etiquetas en español
const statusDisplayNames: Record<OrderStatus, string> = {
  [OrderStatus.IN_CART]: "En Carrito",
  [OrderStatus.PLACED]: "Realizadas",
  [OrderStatus.CONFIRMED]: "Confirmadas",
  [OrderStatus.PROCESSED]: "Procesando",
  [OrderStatus.PICKUP]: "Para Retiro",
  [OrderStatus.SHIPPED]: "Enviadas",
  [OrderStatus.DELIVERED]: "Entregadas"
};

// Mapeo a colores más vibrantes para cada estado
const statusColors: Record<OrderStatus, { 
  bg: string, 
  text: string, 
  shadow: string,
  icon: string,
  activeBg: string,
  activeBorder: string 
}> = {
  [OrderStatus.IN_CART]: { 
    bg: "bg-slate-200", 
    text: "text-slate-900",
    shadow: "shadow-slate-400/20",
    icon: "🛒",
    activeBg: "bg-slate-300",
    activeBorder: "border-slate-500"
  },
  [OrderStatus.PLACED]: { 
    bg: "bg-blue-200", 
    text: "text-blue-900",
    shadow: "shadow-blue-400/20",
    icon: "📝",
    activeBg: "bg-blue-300",
    activeBorder: "border-blue-500"
  },
  [OrderStatus.CONFIRMED]: { 
    bg: "bg-amber-200", 
    text: "text-amber-900",
    shadow: "shadow-amber-400/20",
    icon: "✅",
    activeBg: "bg-amber-300",
    activeBorder: "border-amber-500"
  },
  [OrderStatus.PROCESSED]: { 
    bg: "bg-purple-200", 
    text: "text-purple-900",
    shadow: "shadow-purple-400/20",
    icon: "⚙️",
    activeBg: "bg-purple-300",
    activeBorder: "border-purple-500"
  },
  [OrderStatus.PICKUP]: { 
    bg: "bg-yellow-200", 
    text: "text-yellow-900",
    shadow: "shadow-yellow-400/20",
    icon: "🏪",
    activeBg: "bg-yellow-300",
    activeBorder: "border-yellow-500"
  },
  [OrderStatus.SHIPPED]: { 
    bg: "bg-indigo-200", 
    text: "text-indigo-900",
    shadow: "shadow-indigo-400/20",
    icon: "🚚",
    activeBg: "bg-indigo-300",
    activeBorder: "border-indigo-500"
  },
  [OrderStatus.DELIVERED]: { 
    bg: "bg-green-200", 
    text: "text-green-900",
    shadow: "shadow-green-400/20",
    icon: "📦",
    activeBg: "bg-green-300",
    activeBorder: "border-green-500"
  }
};

export function OrderStatusFilter({ onFilterChange, statusCounts }: OrderStatusFilterProps) {
  const [activeStatus, setActiveStatus] = useState<OrderStatus | null>(null);

  const handleStatusClick = (status: OrderStatus) => {
    if (activeStatus === status) {
      // Si hacemos clic en el filtro activo, lo desactivamos
      setActiveStatus(null);
      onFilterChange(null);
    } else {
      // Si hacemos clic en otro filtro, lo activamos
      setActiveStatus(status);
      onFilterChange(status);
    }
  };

  return (
    <Card className="mb-6 border border-gray-700 bg-gray-800/50 shadow-md">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Filtrar por estado</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setActiveStatus(null);
              onFilterChange(null);
            }}
            className={`border-gray-600 hover:bg-gray-700 hover:text-white ${
              !activeStatus ? 'bg-gray-700 text-white font-medium' : 'text-gray-300'
            }`}
          >
            Ver todas
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {ORDER_STATUS_VALUES.map((status) => (
            status !== OrderStatus.IN_CART && (
              <div 
                key={status}
                onClick={() => handleStatusClick(status)}
                className={`
                  ${statusColors[status].bg} 
                  ${statusColors[status].text}
                  rounded-lg p-3 shadow ${statusColors[status].shadow}
                  flex flex-col items-center text-center 
                  transition-all duration-200 cursor-pointer
                  ${activeStatus === status 
                    ? `${statusColors[status].activeBg} border-2 ${statusColors[status].activeBorder} scale-105` 
                    : 'border-2 border-transparent hover:scale-105'
                  }
                `}
              >
                <span className="text-xl mb-1">{statusColors[status].icon}</span>
                <span className="text-sm font-medium mb-1">{statusDisplayNames[status]}</span>
                <span className="text-lg font-bold">{statusCounts[status] || 0}</span>
                {activeStatus === status && (
                  <div className="absolute top-0 right-0 mt-1 mr-1 bg-white bg-opacity-90 text-green-600 rounded-full w-5 h-5 flex items-center justify-center">
                    ✓
                  </div>
                )}
              </div>
            )
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 