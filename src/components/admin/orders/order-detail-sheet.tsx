"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { EnrichedOrder, EnrichedOrderItem } from "@/lib/queries/order-queries"; // Assuming EnrichedOrder is exported
import { Trash2, Save } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

// Helper to format currency (can be moved to a utils file)
const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
};

interface OrderDetailSheetProps {
  order: EnrichedOrder | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onOrderUpdate: () => void; // Callback to refetch orders after update
}

// Hook para traer los productos de una orden
const useOrderItems = (orderId: string | null) => {
  return useQuery<EnrichedOrderItem[], Error>({
    queryKey: ["order-items", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      if (!orderId) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from("order_item")
        .select(`*, product:product_id(id, name, slug, stock, price, status, brand:brand_id(name), product_media:product_media(media:media_id(url, alt_text)))`)
        .eq("order_id", orderId);
      if (error) throw error;
      return (data || []).map((item: any) => {
        let image_url = "/placeholder.svg";
        const images = item.product?.product_media?.map((pm: any) => pm.media).filter(Boolean);
        if (images && images.length > 0 && images[0]?.url) {
          image_url = images[0].url;
        }
        return {
          ...item,
          product: item.product ? { ...item.product, image_url } : null,
        };
      });
    },
  });
};

export function OrderDetailSheet({ order, isOpen, onOpenChange, onOrderUpdate }: OrderDetailSheetProps) {
  const orderId = order?.id || null;
  const { data: orderItems, isLoading: loadingItems } = useOrderItems(orderId);
  const [editableItems, setEditableItems] = useState<EnrichedOrderItem[]>([]);

  // Effect para inicializar editableItems cuando llegan los items
  useEffect(() => {
    if (order && isOpen && orderItems) {
      setEditableItems(JSON.parse(JSON.stringify(orderItems)));
    } else if (!isOpen) {
      setEditableItems([]);
    }
  }, [order, isOpen, orderItems]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    setEditableItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: Math.max(0, newQuantity) } : item
      )
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setEditableItems(prevItems => prevItems.filter(item => item.id !== itemId));
    // For actual deletion, an API call would be made here
    toast.info("Producto marcado para eliminación. Guarde los cambios para confirmar.");
  };
  
  const handleSaveChanges = async () => {
    if (!order) return;
    // TODO: Implement actual save logic
    // 1. Identify changes (removed items, changed quantities)
    // 2. Call Supabase actions to update order_item and order tables
    // Example:
    // const changedItems = editableItems.filter((item, index) => item.quantity !== order.order_items[index]?.quantity);
    // const removedItemsOriginal = order.order_items.filter(originalItem => !editableItems.find(edItem => edItem.id === originalItem.id));

    console.log("Original Items:", order.order_items);
    console.log("Editable Items (Current state to save):", editableItems);
    toast.promise(
      async () => {
        // Simulate API calls
        // await Promise.all(changedItems.map(item => updateOrderItemQuantity(order.id, item.id, item.quantity)));
        // await Promise.all(removedItemsOriginal.map(item => removeOrderItem(order.id, item.id)));
        // await updateOrderTotals(order.id); // Recalculate order total
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
        onOrderUpdate(); // Call the callback to refetch orders
      },
      {
        loading: "Guardando cambios...",
        success: "Orden actualizada exitosamente.",
        error: (err) => `Error al actualizar: ${err.message || 'Error desconocido'}`,
      }
    );
    onOpenChange(false); // Close sheet
  };

  if (!order) {
    return null;
  }

  const spanishStatus = (status: string | undefined): string => {
    if (!status) return "Desconocido";
    // This mapping can be expanded or moved to a more central location
    const mapping: { [key: string]: string } = {
      "in_cart": "En Carrito",
      "placed": "Realizado",
      "confirmed": "Confirmado",
      "processed": "Procesando",
      "pickup": "Listo para Retiro",
      "delivered": "Entregado",
      "cancelled": "Cancelado",
    };
    return mapping[status.toLowerCase()] || status;
  };
  
  const currentTotalAmount = editableItems.reduce((acc, item) => {
    return acc + (item.price_at_purchase * item.quantity);
  }, 0);


  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-2xl flex flex-col sm:max-w-2xl" side="bottom">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle>Detalle del Pedido: #{order.id.substring(0,8)}</SheetTitle>
          <SheetDescription>
            Administra los ítems del pedido y revisa la información del cliente.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Section 1: Buyer Information */}
            <section>
              <h3 className="text-lg font-semibold text-white mb-3">Datos del Comprador</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <p className="text-gray-400">Nombre:</p>
                  <p className="text-gray-200">{order.user?.first_name || 'N/A'} {order.user?.last_name || ''}</p>
                </div>
                <div>
                  <p className="text-gray-400">Email:</p>
                  <p className="text-gray-200">{order.user?.email || 'N/A'}</p>
                </div>
                {/* order.user does not have phone_number, it's on shipping_address */}
                 {order.shipping_address && (
                  <div>
                    <p className="text-gray-400">Teléfono (Envío):</p>
                    <p className="text-gray-200">{order.shipping_address?.phone_number || 'N/A'}</p>
                  </div>
                )}
              </div>
              {order.shipping_address && (
                <div className="mt-4">
                  <p className="text-gray-400">Dirección de Envío:</p>
                  <p className="text-gray-200">
                    {order.shipping_address.street || 'N/A'} {order.shipping_address.street_number || 'S/N'}
                    <br />
                    {order.shipping_address.city || 'N/A'}, {order.shipping_address.province || 'N/A'} - CP: {order.shipping_address.postal_code || 'N/A'}
                  </p>
                </div>
              )}
               <div className="mt-2">
                  <p className="text-gray-400">Recoge en tienda:</p>
                  <p className="text-gray-200">{order.store_pickup ? 'Sí' : 'No'}</p>
                </div>
            </section>

            <Separator className="bg-gray-700" />

            {/* Section 2: Order Summary */}
            <section>
              <h3 className="text-lg font-semibold text-white mb-3">Resumen del Pedido</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                <div>
                  <p className="text-gray-400">Nº Total de Items:</p>
                  <p className="text-gray-200">{editableItems.reduce((sum, item) => sum + item.quantity, 0)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Estado:</p>
                  <p className="text-gray-200 font-medium">{spanishStatus(order.status_display || order.status)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Total Original:</p>
                  <p className="text-gray-200">{formatCurrency(order.total_amount)}</p>
                </div>
                 <div>
                  <p className="text-gray-400">Total Actual (Editable):</p>
                  <p className="text-gold-400 font-semibold">{formatCurrency(currentTotalAmount)}</p>
                </div>
                {/* Placeholder for Discounts - add logic if discount data becomes available */}
                {/* <div>
                  <p className="text-gray-400">Descuentos Aplicados:</p>
                  <p className="text-gray-200">-\$XX.XX (CODE123)</p>
                </div> */}
              </div>
            </section>
            
            <Separator className="bg-gray-700" />

            {/* Section 3: Product List & Edit */}
            <section>
              <h3 className="text-lg font-semibold text-white mb-3">Productos del Pedido</h3>
              {loadingItems ? (
                <div className="text-gray-400 py-4">Cargando productos...</div>
              ) : (
                <div className="space-y-4">
                  {editableItems.map((item) => (
                    <div key={item.id} className="flex items-start gap-4 border-b border-gray-800 pb-4 last:border-b-0 last:pb-0">
                      <div className="relative w-20 h-20 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                        {item.product?.image_url ? (
                          <Image src={item.product.image_url} alt={item.product.name || 'Producto'} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">Sin Imagen</div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium text-gray-100">{item.product?.name || 'Nombre no disponible'}</p>
                        <p className="text-xs text-gray-400">
                          Marca: {item.product?.brand?.name || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-400">
                          Precio Unitario: {formatCurrency(item.price_at_purchase)}
                        </p>
                         <p className="text-xs text-gray-400">
                          Stock Disponible: {item.product?.stock ?? 'N/A'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2 flex-shrink-0 w-28">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10) || 0)}
                          min="0" // Allow 0 to effectively mark for removal if not deleting directly
                          max={item.product?.stock ?? 99} // Cap at available stock
                          className="w-20 h-8 text-center bg-gray-700 border-gray-600 text-white"
                        />
                         <p className="text-sm font-medium text-gray-200">
                          Subtotal: {formatCurrency(item.price_at_purchase * item.quantity)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-400 hover:bg-red-500/10 w-8 h-8"
                          onClick={() => handleRemoveItem(item.id)}
                          aria-label="Eliminar producto"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {editableItems.length === 0 && !loadingItems && (
                    <p className="text-gray-500 text-center py-4">No hay productos en esta orden después de la edición.</p>
                  )}
                </div>
              )}
            </section>
          </div>
        </ScrollArea>
        <SheetFooter className="px-6 py-4 border-t border-gray-700">
          <SheetClose asChild>
            <Button variant="outline">Cancelar</Button>
          </SheetClose>
          <Button onClick={handleSaveChanges} disabled={false /* TODO: disable if no changes or loading */}>
            <Save size={16} className="mr-2" /> Guardar Cambios
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
} 