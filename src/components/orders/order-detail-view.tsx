import { EnrichedOrder, EnrichedOrderItem } from "@/lib/queries/order-queries";
import Image from "next/image";

interface OrderDetailViewProps {
  order: EnrichedOrder;
}

function OrderItemRow({ item }: { item: EnrichedOrderItem }) {
  if (!item.product) {
    return (
      <div className="flex items-center justify-between py-3 px-4 text-sm text-gray-500">
        <p>Producto no disponible</p>
        <p>Cantidad: {item.quantity || 0}</p>
      </div>
    );
  }

  const subtotal = (item.price_at_purchase || 0) * (item.quantity || 0);

  return (
    <div className="flex items-center gap-4 py-3 px-4 border-b border-gray-700 last:border-b-0">
      <div className="relative w-16 h-16 bg-gray-700 rounded overflow-hidden flex-shrink-0">
        <Image 
          src={item.product.image_url || "/placeholder.svg"} 
          alt={item.product.name} 
          fill 
          className="object-cover" 
        />
      </div>
      <div className="flex-grow">
        <p className="font-medium text-white">{item.product.name}</p>
        <p className="text-sm text-gray-400">
          Cantidad: {item.quantity} x ${Number(item.price_at_purchase).toFixed(2)}
        </p>
      </div>
      <p className="text-gold-400 font-semibold">${subtotal.toFixed(2)}</p>
    </div>
  );
}

export function OrderDetailView({ order }: OrderDetailViewProps) {
  return (
    <div className="p-6 bg-gray-800">
      <h3 className="text-lg font-semibold text-white mb-4">Detalles del Pedido</h3>
      
      <div className="mb-6">
        <h4 className="text-md font-medium text-gold-400 mb-2">Productos</h4>
        <div className="bg-gray-900 rounded-md">
          {order.order_items.length > 0 ? (
            order.order_items.map((item) => (
              <OrderItemRow key={item.id} item={item} />
            ))
          ) : (
            <p className="p-4 text-gray-400">No hay productos en esta orden.</p>
          )}
        </div>
      </div>

      {order.shipping_address && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gold-400 mb-2">Dirección de Envío</h4>
          <div className="text-gray-300 bg-gray-900 p-4 rounded-md space-y-1">
            <p>{order.shipping_address.street} {order.shipping_address.street_number}</p>
            <p>{order.shipping_address.city}, {order.shipping_address.province}</p>
            <p>CP: {order.shipping_address.postal_code}</p>
            <p>Tel: {order.shipping_address.phone_number}</p>
          </div>
        </div>
      )}

      <div className="flex justify-end items-center border-t border-gray-700 pt-4">
        <span className="text-lg text-white font-semibold mr-4">Total del Pedido:</span>
        <span className="text-2xl text-gold-400 font-bold">${Number(order.total).toFixed(2)}</span>
      </div>
    </div>
  );
} 