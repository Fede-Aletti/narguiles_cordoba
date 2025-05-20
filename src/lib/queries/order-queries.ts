import { createClient } from "@/utils/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/lib/store";
import type { IOrder, IOrderItem } from "@/interfaces/order";
import type { IAddress } from "@/interfaces/address";
import type { IProduct } from "@/interfaces/product";
import type { IMediaItem } from "@/interfaces/media";
import { OrderStatus } from "@/interfaces/enums";
import type { IUser } from "@/interfaces/user";

// Enhanced product type for order items, including a primary image URL
export type OrderItemDisplayProduct = IProduct & { image_url?: string };

export interface EnrichedOrderItem extends IOrderItem {
  // Override product to include image_url for display convenience
  product: OrderItemDisplayProduct | null;
}

export interface EnrichedOrder extends Omit<IOrder, 'shipping_address_id' | 'user_id' | 'order_items'> {
  order_items: EnrichedOrderItem[];
  shipping_address: IAddress | null;
  status_display?: string;
}

const orderStatusDisplayMapping: Record<OrderStatus, string> = {
  [OrderStatus.IN_CART]: "En Carrito",
  [OrderStatus.PLACED]: "Realizado",
  [OrderStatus.CONFIRMED]: "Confirmado",
  [OrderStatus.PROCESSED]: "Procesando",
  [OrderStatus.PICKUP]: "Listo para Retiro",
  [OrderStatus.DELIVERED]: "Entregado",
};

// Select only essential product fields for order items to reduce data transfer
const ORDER_ITEM_PRODUCT_SELECT = 
  'id, name, slug, stock, price, status, created_at, product_media:product_media(media:media_id(id, url, alt))';

export async function fetchUserOrdersWithDetails(): Promise<EnrichedOrder[]> {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) throw new Error("Usuario no autenticado.");

  const { data: userProfile, error: profileError } = await supabase
    .from("user")
    .select("id")
    .eq("auth_user_id", authUser.id)
    .single<Pick<IUser, 'id'> >();

  if (profileError || !userProfile) {
    console.error("Error fetching user profile for orders:", profileError);
    throw new Error(profileError?.message || "Perfil de usuario no encontrado.");
  }

  const { data: ordersData, error: ordersError } = await supabase
    .from("order")
    .select("*, shipping_address:shipping_address_id(*)") // Fetches IOrder compatible structure
    .eq("user_id", userProfile.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (ordersError) {
    console.error("Error fetching orders:", ordersError);
    throw ordersError;
  }
  if (!ordersData) return [];

  const enrichedOrders = await Promise.all(
    ordersData.map(async (orderData) => {
      // orderData here is essentially IOrder with populated shipping_address
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_item") // Fetches IOrderItem compatible structure, with populated product
        .select(`*, product:product_id (${ORDER_ITEM_PRODUCT_SELECT})`)
        .eq("order_id", orderData.id)
        .is("deleted_at", null);

      let processedItems: EnrichedOrderItem[] = [];
      if (itemsError) {
        console.error(`Error fetching order items for order ${orderData.id}:`, itemsError);
      } else if (itemsData) {
        processedItems = itemsData.map((item: any) => {
          const rawProduct = item.product as IProduct; // Product data from the query
          let displayProduct: OrderItemDisplayProduct | null = null;
          if (rawProduct) {
            let imageUrl = "/placeholder.svg";
            // Attempt to get first image from product_media or images array from IProduct
            const images = rawProduct.product_media?.map(pm => pm.media).filter(Boolean) as IMediaItem[] | undefined;
            if (images && images.length > 0 && images[0]?.url) {
              imageUrl = images[0].url;
            }
            displayProduct = {
              ...rawProduct, // Spread all IProduct fields
              image_url: imageUrl,
            };
          }
          return {
            ...item, // Spread IOrderItem fields
            product: displayProduct,
          } as EnrichedOrderItem;
        });
      }
      
      const {user_id, shipping_address_id, order_items, ...restOfOrderData} = orderData as IOrder;

      return {
        ...restOfOrderData, // Spread IOrder fields (excluding what's replaced)
        order_items: processedItems,
        shipping_address: orderData.shipping_address as IAddress | null,
        status_display: orderStatusDisplayMapping[orderData.status as OrderStatus] || orderData.status,
      } as EnrichedOrder;
    })
  );

  return enrichedOrders;
}

export function useUserOrdersWithDetails() {
  return useQuery<EnrichedOrder[], Error>({
    queryKey: ["user-orders-with-details"],
    queryFn: fetchUserOrdersWithDetails,
  });
}

interface CartItemForOrder {
  product: Pick<IProduct, 'id' | 'price'>; 
  quantity: number;
}

export async function createOrderFromCart(
  addressId: string, 
  cartItems: CartItemForOrder[], 
  storePickup: boolean = false
): Promise<{ id: string }> { 
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) throw new Error("Debes iniciar sesión para realizar un pedido.");

  const { data: userProfile, error: profileError } = await supabase
    .from("user")
    .select("id")
    .eq("auth_user_id", authUser.id)
    .single<Pick<IUser, 'id'> >();
  if (profileError || !userProfile) {
    throw new Error(profileError?.message || "No se encontró el perfil del usuario.");
  }

  const totalAmount = cartItems.reduce((sum, item) => {
    const price = item.product.price || 0; 
    return sum + price * item.quantity;
  }, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const orderPayload: Omit<IOrder, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'order_items' | 'user' | 'shipping_address'> = {
    user_id: userProfile.id,
    status: OrderStatus.PLACED,
    total_amount: totalAmount,
    total_items: totalItems,
    shipping_address_id: storePickup ? null : addressId,
    store_pickup: storePickup,
  };

  const { data: orderData, error: orderError } = await supabase
    .from("order")
    .insert(orderPayload)
    .select("id")
    .single<{id: string}>();

  if (orderError || !orderData) {
    console.error("Error creating order:", orderError);
    throw new Error(orderError?.message || "Error al crear la orden.");
  }

  const orderItemsToInsert = cartItems.map((item) => ({
    order_id: orderData.id,
    product_id: item.product.id, 
    quantity: item.quantity,
    price_at_purchase: item.product.price || 0, 
  }));

  const { error: itemsError } = await supabase.from("order_item").insert(orderItemsToInsert);

  if (itemsError) {
    console.error("Error creating order items:", itemsError);
    await supabase.from("order").delete().eq("id", orderData.id);
    throw new Error(itemsError.message || "Error al agregar los productos a la orden. La orden ha sido cancelada.");
  }
  return { id: orderData.id };
}

export function useCreateOrder() {
  const { clearCart } = useStore(); 
  const queryClient = useQueryClient();
  return useMutation<
    { id: string }, 
    Error, 
    { addressId: string; cartItems: CartItemForOrder[]; storePickup?: boolean } 
  >({
    mutationFn: (vars) => createOrderFromCart(vars.addressId, vars.cartItems, vars.storePickup),
    onSuccess: () => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["user-orders-with-details"] });
      queryClient.invalidateQueries({ queryKey: ["user-cart"] }); 
    },
  });
}
