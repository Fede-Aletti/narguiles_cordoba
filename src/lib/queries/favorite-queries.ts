import { createClient } from "@/utils/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/lib/store"; // Corregir ruta de importación
import type { IFavorite } from "@/interfaces/favorite";
import type { IUser } from "@/interfaces/user"; // For userProfile.id type

export interface Favorite {
  id: number;
  user_id: number;
  product_id: number;
  created_at: string;
}

// Obtener los IDs de productos favoritos de un usuario
export async function fetchUserFavoriteProductIds(): Promise<string[]> {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return [];

  const { data: userProfile, error: profileError } = await supabase
    .from("user")
    .select("id") // IUser.id is string (UUID)
    .eq("auth_user_id", authUser.id)
    .single<Pick<IUser, 'id'> >();

  if (profileError || !userProfile) {
    console.error("Error fetching user profile for favorites:", profileError);
    return [];
  }

  const { data, error } = await supabase
    .from("favorite")
    .select("product_id") // IFavorite.product_id is string (UUID)
    .eq("user_id", userProfile.id);

  if (error) {
    console.error("Error fetching user favorites:", error);
    throw error;
  }
  return data ? data.map(fav => fav.product_id as string) : [];
}

export function useUserFavoriteProductIds() {
  const { setFavoriteIds } = useStore.getState();
  return useQuery<string[], Error>({
    queryKey: ["user-favorites"],
    queryFn: async () => {
      const ids = await fetchUserFavoriteProductIds();
      setFavoriteIds(ids || []); 
      return ids || [];
    },
  });
}

// Añadir un producto a favoritos
export async function addFavorite(productId: string): Promise<IFavorite | null> {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) throw new Error("Usuario no autenticado para añadir favorito.");

  const { data: userProfile, error: profileError } = await supabase
    .from("user")
    .select("id")
    .eq("auth_user_id", authUser.id)
    .single<Pick<IUser, 'id'> >();

  if (profileError || !userProfile) {
    console.error("Error fetching user profile for addFavorite:", profileError);
    throw new Error(profileError?.message || "Perfil de usuario no encontrado.");
  }

  const { data, error } = await supabase
    .from("favorite")
    .insert({ product_id: productId, user_id: userProfile.id })
    .select("*") // Select all fields for IFavorite
    .single<IFavorite>();
  
  if (error) {
    if (error.code === '23505') { 
      console.warn(`Product ${productId} is already a favorite for user ${userProfile.id}.`);
      const { data: existingFav } = await supabase
        .from("favorite")
        .select("*")
        .eq("user_id", userProfile.id)
        .eq("product_id", productId)
        .single<IFavorite>();
      return existingFav;
    }
    console.error("Error adding favorite:", error);
    throw error;
  }
  return data;
}

// Quitar un producto de favoritos
export async function removeFavorite(productId: string): Promise<{ product_id: string } | null> {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) throw new Error("Usuario no autenticado para quitar favorito.");

  const { data: userProfile, error: profileError } = await supabase
    .from("user")
    .select("id")
    .eq("auth_user_id", authUser.id)
    .single<Pick<IUser, 'id'> >();

  if (profileError || !userProfile) {
    console.error("Error fetching user profile for removeFavorite:", profileError);
    throw new Error(profileError?.message || "Perfil de usuario no encontrado.");
  }

  const { data, error } = await supabase
    .from("favorite")
    .delete()
    .eq("product_id", productId)
    .eq("user_id", userProfile.id)
    .select("product_id") 
    .single<{ product_id: string }>(); 

  if (error) {
    console.error("Error removing favorite:", error);
    throw error;
  }
  return data ? { product_id: data.product_id } : null;
}

// Hook para añadir/quitar favorito (toggle)
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { addFavoriteIdToStore, removeFavoriteIdFromStore } = useStore.getState();

  return useMutation<
    IFavorite | { product_id: string } | null, 
    Error,
    { productId: string; isCurrentlyFavorite: boolean }
  >({
    mutationFn: async ({ productId, isCurrentlyFavorite }) => {
      if (isCurrentlyFavorite) {
        return await removeFavorite(productId);
      } else {
        return await addFavorite(productId);
      }
    },
    onSuccess: (data, variables) => {
      if (variables.isCurrentlyFavorite) { 
        removeFavoriteIdFromStore(variables.productId);
      } else { 
        if(data && ('id' in data)) { 
            addFavoriteIdToStore(variables.productId);
        }
      }
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
      queryClient.invalidateQueries({ queryKey: ["product-favorite-count", variables.productId] });
    },
    onError: (error) => {
      console.error("Error toggling favorite:", error);
    },
  });
}

// Obtener el conteo de favoritos para un producto
export async function getProductFavoriteCount(productId: string): Promise<number> {
  const supabase = createClient();
  const { count, error } = await supabase
    .from("favorite")
    .select("*", { count: "exact", head: true })
    .eq("product_id", productId);

  if (error) {
    console.error(`Error fetching favorite count for product ${productId}:`, error.message);
    return 0;
  }
  return count || 0;
}

export function useProductFavoriteCount(productId: string) {
  return useQuery<number, Error>({
    queryKey: ["product-favorite-count", productId],
    queryFn: () => getProductFavoriteCount(productId),
    enabled: !!productId,
  });
} 