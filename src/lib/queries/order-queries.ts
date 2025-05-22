import { createClient } from "@/utils/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/lib/store";
import type { IOrder, IOrderItem, IOrderUser } from "@/interfaces/order";
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
  [OrderStatus.SHIPPED]: "Enviado",
  [OrderStatus.DELIVERED]: "Entregado",
};

// Select only essential product fields for order items to reduce data transfer
const ORDER_ITEM_PRODUCT_SELECT = 
  'id, name, slug, stock, price, status, created_at, brand:brand_id(name), product_media:product_media(media:media_id(id, url, alt_text))';

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

// Interface for pagination, sorting, and filtering parameters
export interface AdminOrdersParams {
  pageIndex: number;
  pageSize: number;
  globalFilter?: string;
  sorting?: { id: string; desc: boolean }[];
  // TODO: Add columnFilters if needed
}

// Interface for the paginated response
export interface PaginatedAdminOrdersResponse {
  orders: EnrichedOrder[];
  totalCount: number;
  pageCount: number;
}

const ADMIN_ORDER_SELECT_QUERY = 
  "id, created_at, status, total_amount, total_items, store_pickup, " +
  "user:user_id(id, first_name, last_name, email), " +
  "shipping_address:shipping_address_id(*), " +
  // Order items are not fetched in the main list for performance, they are fetched in detail view
  "order_items_count:order_item(count)"; // Get count of items for summary

// Function to fetch orders for admin view with pagination, filtering, sorting
export async function fetchAdminOrders(params: AdminOrdersParams): Promise<PaginatedAdminOrdersResponse> {
  const supabase = createClient();
  const { pageIndex, pageSize, globalFilter, sorting } = params;

  let query = supabase
    .from("order")
    .select(ADMIN_ORDER_SELECT_QUERY, { count: "exact" })
    .range(pageIndex * pageSize, (pageIndex + 1) * pageSize - 1);

  if (globalFilter) {
    query = query.or(
      `id.ilike.%${globalFilter}%,` +
      `user.first_name.ilike.%${globalFilter}%,` +
      `user.last_name.ilike.%${globalFilter}%,` +
      `user.email.ilike.%${globalFilter}%`
    );
  }

  if (sorting && sorting.length > 0) {
    sorting.forEach(sort => {
      query = query.order(sort.id, { ascending: !sort.desc });
    });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching admin orders:", error);
    throw error;
  }

  const rawOrders = data as any[] || []; 

  const orders = rawOrders.map(order => {
    const orderItemsCount = (order.order_items_count && Array.isArray(order.order_items_count) && order.order_items_count[0]?.count) || 0;
    
    // Construct the EnrichedOrder object carefully
    const enriched: EnrichedOrder = {
      id: order.id as string,
      created_at: order.created_at as string,
      status: order.status as OrderStatus,
      total_amount: order.total_amount as number | null,
      store_pickup: order.store_pickup as boolean,
      updated_at: order.updated_at as string | null,
      deleted_at: order.deleted_at as string | null,      
      user: order.user ? {
        id: order.user.id as string,
        first_name: order.user.first_name as string | null,
        last_name: order.user.last_name as string | null,
        email: order.user.email as string | null,
      } : null,
      shipping_address: order.shipping_address ? {
        id: order.shipping_address.id as string,
        street: order.shipping_address.street as string | null,
        street_number: order.shipping_address.street_number as string | null,
        city: order.shipping_address.city as string | null,
        province: order.shipping_address.province as string | null,
        postal_code: order.shipping_address.postal_code as string | null,
        phone_number: order.shipping_address.phone_number as string | null,
        // Ensure all IAddress fields are mapped if they exist on order.shipping_address
        user_id: order.shipping_address.user_id as string | null,
        created_at: order.shipping_address.created_at as string, // IAddress requires created_at
        updated_at: order.shipping_address.updated_at as string | null,
        deleted_at: order.shipping_address.deleted_at as string | null,
      } : null,
      order_items: [], // Items will be fetched on demand in detail view
      total_items: orderItemsCount, 
      status_display: orderStatusDisplayMapping[order.status as OrderStatus] || order.status,
    };
    return enriched;
  });
  
  const totalCount = count || 0;
  const pageCount = Math.ceil(totalCount / pageSize);

  return { orders, totalCount, pageCount };
}

// React Query hook for admin orders
export function useAdminOrders(params: AdminOrdersParams) {
  return useQuery<PaginatedAdminOrdersResponse, Error>({
    queryKey: ["admin-orders", params],
    queryFn: () => fetchAdminOrders(params),
    placeholderData: (previousData) => previousData,
  });
}
