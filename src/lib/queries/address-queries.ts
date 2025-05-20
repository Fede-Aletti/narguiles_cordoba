import { createClient } from '@/utils/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { IAddress } from '@/interfaces/address';
import type { IUser } from '@/interfaces/user'; // For userProfile.id type

// Renamed: Fetches addresses for the currently authenticated user
export async function fetchMyAddresses(): Promise<IAddress[]> {
  const supabase = createClient();
  
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser) {
    console.log("fetchMyAddresses: No authenticated user found.");
    return [];
  }

  // Fetch the public user profile ID using the authUser.id
  const { data: userProfile, error: profileError } = await supabase
    .from('user') // public.user table
    .select('id') 
    .eq('auth_user_id', authUser.id) // Link via auth_user_id
    .single<{ id: string }>(); // Expecting a single object with an id property

  if (profileError || !userProfile) {
    console.error("fetchMyAddresses: Error fetching user profile or profile not found.", profileError);
    return []; 
  }

  const { data, error } = await supabase
    .from('address')
    .select('*')
    .eq('user_id', userProfile.id) // Filter by public.user.id
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("fetchMyAddresses: Error fetching addresses for user.", error);
    throw error; 
  }
  
  return (data as IAddress[]) || [];
}

// Updated hook to use fetchMyAddresses
export function useUserAddresses() {
  return useQuery<IAddress[], Error>({
    queryKey: ['my-user-addresses'], // Changed queryKey for clarity
    queryFn: fetchMyAddresses,
  });
}

// New function to fetch addresses for a specific user (for admin)
export async function fetchAddressesByUserId(userId: string): Promise<IAddress[]> {
  if (!userId) {
    console.log("fetchAddressesByUserId: No userId provided.");
    return [];
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from('address')
    .select('*')
    .eq('user_id', userId) // userId here is public.user.id
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`fetchAddressesByUserId: Error fetching addresses for user ${userId}.`, error);
    throw error;
  }
  return (data as IAddress[]) || [];
}

// New hook for admin to fetch addresses by user ID
export function useAddressesByUserId(userId: string | undefined | null) {
  return useQuery<IAddress[], Error>({
    queryKey: ['user-addresses', userId], // Include userId in queryKey
    queryFn: () => userId ? fetchAddressesByUserId(userId) : Promise.resolve([]),
    enabled: !!userId, // Only run query if userId is present
  });
}

// Payload for creating an address, user_id will be automatically assigned
export type CreateAddressPayload = Omit<IAddress, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>;

export async function createAddress(payload: CreateAddressPayload): Promise<IAddress> {
  const supabase = createClient();
  
  const { data: { user: authUser }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !authUser) {
    throw new Error(authErr?.message || "Usuario no autenticado para crear dirección.");
  }
  const { data: userProfile, error: profileErr } = await supabase
    .from('user')
    .select('id')
    .eq('auth_user_id', authUser.id)
    .single<{id: string}>();

  if (profileErr || !userProfile) {
    throw new Error(profileErr?.message || "Perfil de usuario no encontrado para crear dirección.");
  }

  const addressToInsert = { 
    ...payload, 
    user_id: userProfile.id 
  };

  const { data, error } = await supabase
    .from('address')
    .insert(addressToInsert)
    .select('*')
    .single<IAddress>();

  if (error) throw error;
  if (!data) throw new Error("Failed to create address or return data.");
  return data;
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation<IAddress, Error, CreateAddressPayload>({
    mutationFn: createAddress,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['my-user-addresses'] }); // Invalidate self-addresses
      // Optionally, if an admin creates an address for another user (not typical via this hook),
      // you might need a more specific invalidation or update.
    },
  });
}

// Placeholder for Update and Delete address queries if needed in the future
// export async function updateAddress(addressId: string, payload: Partial<Omit<IAddress, 'id' | 'user_id' | 'created_at' | 'deleted_at'>>): Promise<IAddress> { ... }
// export function useUpdateAddress() { ... }
// export async function deleteAddress(addressId: string): Promise<void> { ... }
// export function useDeleteAddress() { ... }

