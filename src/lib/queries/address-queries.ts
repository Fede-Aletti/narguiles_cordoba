import { createClient } from '@/utils/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Address } from '@/interfaces/address';

export async function fetchUserAddresses(): Promise<Address[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('address')
    .select('*')
    .is('deleted_at', null);
  if (error) throw error;
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
  const { data, error } = await supabase
    .from('address')
    .insert([address])
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

