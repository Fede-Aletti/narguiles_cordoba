import { createClient } from "@/utils/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/lib/store";
import type { Order as BaseOrder, OrderItem as BaseOrderItem } from "@/interfaces/order";
import type { Address } from "@/interfaces/address";
import type { Product as BaseProduct } from "@/interfaces/product";
import type { Media } from "@/interfaces/media";
import type { OrderStatus } from "@/interfaces/enums";

// Interfaces para las órdenes enriquecidas
export interface OrderProduct extends BaseProduct {
  image_url?: string;
  product_media?: Array<{ media: Pick<Media, "id" | "url" | "alt"> | null }>;
}

export interface EnrichedOrderItem extends BaseOrderItem {
  product: OrderProduct | null;
}

export interface EnrichedOrder extends Omit<BaseOrder, 'shipping_address_id'> {
  order_items: EnrichedOrderItem[];
  shipping_address: Address | null;
  status_display?: string;
}

const orderStatusDisplay: Record<OrderStatus, string> = {
  in_cart: "En Carrito",
  placed: "Realizado",
  confirmed: "Confirmado",
  processed: "Procesando",
  pickup: "Listo para Retiro",
  delivered: "Entregado",
};

export async function fetchUserOrdersWithDetails(): Promise<EnrichedOrder[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuario no autenticado.");

  const { data: userProfile } = await supabase
    .from("user")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!userProfile) throw new Error("Perfil de usuario no encontrado.");

  const { data: ordersData, error: ordersError } = await supabase
    .from("order")
    .select("*, shipping_address:shipping_address_id(*)")
    .eq("user_id", userProfile.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (ordersError) {
    console.error("Error fetching orders:", ordersError);
    throw ordersError;
  }
  if (!ordersData) return [];

  const enrichedOrders = await Promise.all(
    ordersData.map(async (order) => {
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_item")
        .select(
          `
          id, order_id, product_id, quantity, price_at_purchase, created_at,
          product:product_id (
            id, name, slug, stock, price,
            product_media (
              media:media_id (id, url, alt)
            )
          )
        `
        )
        .eq("order_id", order.id)
        .is("deleted_at", null);

      if (itemsError) {
        console.error("Error fetching order items for order " + order.id + ":", itemsError);
        // Continuar con el resto de las órdenes, pero esta orden no tendrá items
        return {
          ...order,
          order_items: [],
          shipping_address: order.shipping_address as Address | null,
          status_display: orderStatusDisplay[order.status as OrderStatus] || order.status,
        } as EnrichedOrder;
      }

      const processedItems = itemsData?.map((item) => {
          let imageUrl = "/placeholder.svg";
          const currentProduct = item.product as unknown as (OrderProduct | null);

          if (currentProduct && currentProduct.product_media && currentProduct.product_media.length > 0) {
            const firstMediaRelation = currentProduct.product_media[0];
            if (firstMediaRelation && firstMediaRelation.media && firstMediaRelation.media.url) {
              imageUrl = firstMediaRelation.media.url;
            }
          }
          return {
            ...item,
            product: currentProduct ? {
              ...currentProduct,
              image_url: imageUrl,
            } : null,
          };
        }) || [];

      return {
        ...order,
        order_items: processedItems,
        shipping_address: order.shipping_address as Address | null,
        status_display: orderStatusDisplay[order.status as OrderStatus] || order.status,
      } as EnrichedOrder;
    })
  );

  return enrichedOrders;
}

export function useUserOrdersWithDetails() {
  return useQuery<EnrichedOrder[], Error>({
    queryKey: ["user-orders-with-details"],
    queryFn: fetchUserOrdersWithDetails,
    // Podrías añadir opciones como staleTime o refetchOnWindowFocus si es necesario
  });
}

// Mantener la función createOrder por si se necesita en otros lados o para referencia
export async function createOrderMutationFunc({ // Renombrar para evitar conflicto de nombres
  addressId,
  cartItems,
}: {
  addressId: number;
  cartItems: any[]; // Debería ser CartItem[] del store
}) {
  const supabase = createClient();
  const {data: { user }} = await supabase.auth.getUser();
  if (!user) throw new Error("Debes iniciar sesión para realizar un pedido.");

  const { data: userProfile } = await supabase
    .from("user")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();
  if (!userProfile) throw new Error("No se encontró el perfil del usuario.");

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const total_quantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const { data: orderData, error: orderError } = await supabase
    .from("order")
    .insert([
      {
        user_id: userProfile.id,
        status: "placed" as OrderStatus,
        total,
        total_quantity,
        shipping_address_id: addressId,
      },
    ])
    .select("id")
    .single();

  if (orderError || !orderData) {
    console.error("Error creating order:", orderError);
    throw new Error(orderError?.message || "Error al crear la orden.");
  }

  const orderItemsToInsert = cartItems.map((item) => ({
    order_id: orderData.id,
    product_id: item.product.id,
    quantity: item.quantity,
    price_at_purchase: item.product.price,
  }));

  const { error: itemsError } = await supabase.from("order_item").insert(orderItemsToInsert);

  if (itemsError) {
    console.error("Error creating order items:", itemsError);
    // Aquí se podría intentar eliminar la orden creada si fallan los ítems,
    // pero por simplicidad, solo lanzamos el error.
    throw new Error(itemsError.message || "Error al agregar los productos a la orden.");
  }
  return orderData; // Devuelve el objeto { id: number }
}

export function useCreateOrder() {
  const { clearCart } = useStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrderMutationFunc,
    onSuccess: () => {
      clearCart();
      // Invalidar la query de órdenes para que se actualice la lista
      queryClient.invalidateQueries({ queryKey: ["user-orders-with-details"] });
    },
    // onError: (error) => { /* Manejar errores, e.g., mostrar toast */ }
  });
}
