import { createClient } from "@/utils/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/lib/store"; // Corregir ruta de importación

export interface Favorite {
  id: number;
  user_id: number;
  product_id: number;
  created_at: string;
}

// Obtener los IDs de productos favoritos de un usuario
export async function fetchUserFavoriteProductIds(): Promise<number[]> {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return []; // O throw new Error("Usuario no autenticado");

  // Necesitamos el user.id de la tabla 'user', no el authUser.id directamente para la FK
  const { data: userProfile, error: profileError } = await supabase
    .from("user")
    .select("id")
    .eq("auth_user_id", authUser.id)
    .single();

  if (profileError || !userProfile) {
    console.error("Error fetching user profile for favorites:", profileError);
    return [];
  }

  const { data, error } = await supabase
    .from("favorite")
    .select("product_id")
    .eq("user_id", userProfile.id);

  if (error) {
    console.error("Error fetching user favorites:", error);
    throw error;
  }
  return data ? data.map(fav => fav.product_id) : [];
}

export function useUserFavoriteProductIds() {
  const { setFavoriteIds } = useStore.getState();
  return useQuery<number[], Error>({
    queryKey: ["user-favorites"],
    queryFn: async () => { // Hacer queryFn async y mover lógica de onSuccess aquí
      const ids = await fetchUserFavoriteProductIds();
      setFavoriteIds(ids || []); // Actualizar store global
      return ids || [];
    },
    // onSuccess fue removido de las opciones directas en RQ v5 para useQuery
    // La lógica ahora está en queryFn o se puede manejar con useEffect en el componente
  });
}

// Añadir un producto a favoritos
export async function addFavorite(productId: number): Promise<Favorite | null> {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) throw new Error("Usuario no autenticado para añadir favorito.");

  const { data: userProfile, error: profileError } = await supabase
    .from("user")
    .select("id")
    .eq("auth_user_id", authUser.id)
    .single();

  if (profileError || !userProfile) {
    console.error("Error fetching user profile for addFavorite:", profileError);
    throw new Error(profileError?.message || "Perfil de usuario no encontrado.");
  }

  const { data, error } = await supabase
    .from("favorite")
    .insert({ product_id: productId, user_id: userProfile.id })
    .select()
    .single();
  
  if (error) {
    // PGRST116 es el código para violación de constraint unique (ya es favorito)
    if (error.code === '23505') { // Código para unique_violation en PostgreSQL
      console.warn(`Product ${productId} is already a favorite for user ${userProfile.id}.`);
      // Podríamos querer retornar el favorito existente o simplemente null/undefined
      // Por ahora, busquemos el existente para ser consistentes si la UI lo espera
      const { data: existingFav } = await supabase
        .from("favorite")
        .select("*")
        .eq("user_id", userProfile.id)
        .eq("product_id", productId)
        .single();
      return existingFav;
    }
    console.error("Error adding favorite:", error);
    throw error;
  }
  return data;
}

// Quitar un producto de favoritos
export async function removeFavorite(productId: number): Promise<{ product_id: number } | null> {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) throw new Error("Usuario no autenticado para quitar favorito.");

  const { data: userProfile, error: profileError } = await supabase
    .from("user")
    .select("id")
    .eq("auth_user_id", authUser.id)
    .single();

  if (profileError || !userProfile) {
    console.error("Error fetching user profile for removeFavorite:", profileError);
    throw new Error(profileError?.message || "Perfil de usuario no encontrado.");
  }

  const { data, error } = await supabase
    .from("favorite")
    .delete()
    .eq("product_id", productId)
    .eq("user_id", userProfile.id)
    .select("product_id") // Devolver el product_id para identificar qué se borró
    .single(); // Asumimos que solo habrá uno o ninguno

  if (error) {
    console.error("Error removing favorite:", error);
    throw error;
  }
  // data será el objeto {product_id: number} o null si no se encontró para borrar
  return data ? { product_id: data.product_id } : null;
}

// Hook para añadir/quitar favorito (toggle)
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { addFavoriteIdToStore, removeFavoriteIdFromStore } = useStore.getState();

  return useMutation<
    Favorite | { product_id: number } | null, // Tipo de retorno de add/remove
    Error,
    { productId: number; isCurrentlyFavorite: boolean }
  >({
    mutationFn: async ({ productId, isCurrentlyFavorite }) => {
      if (isCurrentlyFavorite) {
        return await removeFavorite(productId);
      } else {
        return await addFavorite(productId);
      }
    },
    onSuccess: (data, variables) => {
      // Actualizar el store global
      if (variables.isCurrentlyFavorite) { // Se eliminó
        removeFavoriteIdFromStore(variables.productId);
      } else { // Se añadió
        if(data && ('id' in data)) { // data es Favorite (se añadió)
            addFavoriteIdToStore(variables.productId);
        }
      }
      // Invalidar la query de favoritos del usuario para refrescar la lista desde la DB
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
      // También invalidar el conteo de favoritos para el producto específico
      queryClient.invalidateQueries({ queryKey: ["product-favorite-count", variables.productId] });
      // Podrías querer invalidar la query del producto si esta incluye isFavorite
      // queryClient.invalidateQueries({ queryKey: ["product", variables.productId] }); 
    },
    onError: (error) => {
      console.error("Error toggling favorite:", error);
      // Aquí podrías mostrar una notificación al usuario
    },
  });
}

// Obtener el conteo de favoritos para un producto
export async function getProductFavoriteCount(productId: number): Promise<number> {
  const supabase = createClient();
  const { count, error } = await supabase
    .from("favorite")
    .select("*", { count: "exact", head: true })
    .eq("product_id", productId);

  if (error) {
    console.error(`Error fetching favorite count for product ${productId}:`, error.message);
    // Don't throw, return 0 so the page can still render
    return 0;
  }
  return count || 0;
}

export function useProductFavoriteCount(productId: number) {
  return useQuery<number, Error>({
    queryKey: ["product-favorite-count", productId],
    queryFn: () => getProductFavoriteCount(productId),
    enabled: !!productId, // Solo ejecutar si productId está disponible
  });
} 