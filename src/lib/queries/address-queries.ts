import { createClient } from '@/utils/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { IAddress } from '@/interfaces/address';
import type { IUser } from '@/interfaces/user'; // For userProfile.id type

export async function fetchUserAddresses(): Promise<IAddress[]> {
  const supabase = createClient();
  
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser) {
    console.log("fetchUserAddresses: No authenticated user found.");
    return [];
  }

  const { data: userProfile, error: profileError } = await supabase
    .from('user')
    .select('id') // IUser.id is string (UUID)
    .eq('auth_user_id', authUser.id)
    .single<Pick<IUser, 'id'> >();

  if (profileError || !userProfile) {
    console.error("fetchUserAddresses: Error fetching user profile or profile not found.", profileError);
    return []; 
  }

  const { data, error } = await supabase
    .from('address')
    .select('*') // Selects all fields for IAddress
    .eq('user_id', userProfile.id) 
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("fetchUserAddresses: Error fetching addresses for user.", error);
    throw error; 
  }
  
  return (data as IAddress[]) || [];
}

export function useUserAddresses() {
  return useQuery<IAddress[], Error>({
    queryKey: ['user-addresses'],
    queryFn: fetchUserAddresses,
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
    .single<Pick<IUser, 'id'> >();

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
    .select('*') // Selects all fields for IAddress
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
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] });
      // Optionally, you can update the cache directly here with the newly created address `data`
    },
  });
}

// Placeholder for Update and Delete address queries if needed in the future
// export async function updateAddress(addressId: string, payload: Partial<Omit<IAddress, 'id' | 'user_id' | 'created_at' | 'deleted_at'>>): Promise<IAddress> { ... }
// export function useUpdateAddress() { ... }
// export async function deleteAddress(addressId: string): Promise<void> { ... }
// export function useDeleteAddress() { ... }

