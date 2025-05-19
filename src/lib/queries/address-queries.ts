import { createClient } from '@/utils/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Address } from '@/interfaces/address';

export async function fetchUserAddresses(): Promise<Address[]> {
  const supabase = createClient();
  
  // Get current authenticated user's auth.users.id
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser) {
    // If no user is authenticated, return an empty array or handle as an error
    // For checkout, if this is called, the page-level auth guard should have already redirected.
    // However, returning empty is safer here.
    console.log("fetchUserAddresses: No authenticated user found.");
    return [];
  }

  // Get the user_id from your public 'user' table
  const { data: userProfile, error: profileError } = await supabase
    .from('user')
    .select('id')
    .eq('auth_user_id', authUser.id)
    .single();

  if (profileError || !userProfile) {
    console.error("fetchUserAddresses: Error fetching user profile or profile not found.", profileError);
    return []; // Return empty if profile not found or error
  }

  // Fetch addresses for the specific user_id
  const { data, error } = await supabase
    .from('address')
    .select('*')
    .eq('user_id', userProfile.id) // Filter by the user's ID from the 'user' table
    .is('deleted_at', null)
    .order('created_at', { ascending: false }); // Optional: order by creation date
    
  if (error) {
    console.error("fetchUserAddresses: Error fetching addresses for user.", error);
    throw error; // Or return [] depending on how you want to handle errors upstream
  }
  
  return data || [];
}

export function useUserAddresses() {
  return useQuery({
    queryKey: ['user-addresses'],
    queryFn: fetchUserAddresses,
  });
}

export async function createAddress(address: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) {
  const supabase = createClient();
  
  // Obtener el user_id del perfil del usuario autenticado
  const { data: { user: authUser }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !authUser) {
    throw new Error(authErr?.message || "Usuario no autenticado para crear dirección.");
  }
  const { data: userProfile, error: profileErr } = await supabase
    .from('user')
    .select('id')
    .eq('auth_user_id', authUser.id)
    .single();
  if (profileErr || !userProfile) {
    throw new Error(profileErr?.message || "Perfil de usuario no encontrado para crear dirección.");
  }

  const { data, error } = await supabase
    .from('address')
    .insert([{ ...address, user_id: userProfile.id }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] });
    },
  });
}

