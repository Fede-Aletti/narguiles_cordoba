import { createClient } from '@/utils/supabase/server';
import type { IUser } from '@/interfaces/user';
import type { IMediaItem } from '@/interfaces/media';
import { GenderType, UserRole } from '@/interfaces/enums';

export type UserWithAuthEmail = IUser & { email?: string };

const USER_SELECT_QUERY = 'id, auth_user_id, first_name, last_name, phone_number, role, gender, created_at, updated_at, deleted_at, avatar_image:avatar_image_id(*)';

function mapRawUserToIUser(rawUser: any, authEmail?: string): UserWithAuthEmail {
  const user = {
    ...rawUser,
    avatar_image: rawUser.avatar_image as IMediaItem | null,
  } as IUser;
  if (authEmail) {
    return { ...user, email: authEmail };
  }
  return user;
}

// Fetch all active users and their auth emails
export async function fetchUsersWithAuthEmail(): Promise<UserWithAuthEmail[]> {
  const supabase = await createClient();

  const { data: users, error: usersError } = await supabase
    .from('user')
    .select(USER_SELECT_QUERY)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (usersError) throw new Error(usersError.message);
  if (!users) return [];

  // Get auth.user emails for all fetched users
  const authUserIds = users.map(u => u.auth_user_id);
  const { data: authUsers, error: authError } = await supabase
    .from('auth.users')
    .select('id, email')
    .in('id', authUserIds);

  if (authError) {
    console.warn("Could not fetch auth user emails:", authError.message); 
  }

  const authEmailMap = new Map(authUsers?.map(au => [au.id, au.email]));

  return users.map(user => mapRawUserToIUser(user, authEmailMap.get(user.auth_user_id)));
}

// Fetch a single user by ID with auth email
export async function fetchUserByIdWithAuthEmail(id: string): Promise<UserWithAuthEmail | null> {
  const supabase = await createClient();
  const { data: user, error: userError } = await supabase
    .from('user')
    .select(USER_SELECT_QUERY)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (userError) throw new Error(userError.message);
  if (!user) return null;

  const { data: authUser, error: authError } = await supabase
    .from('auth.users')
    .select('email')
    .eq('id', user.auth_user_id)
    .single();

  if (authError) {
    console.warn(`Could not fetch auth email for user ${id}:`, authError.message);
  }
  
  return mapRawUserToIUser(user, authUser?.email);
}


export interface UpdateUserPayload {
  first_name?: string | null;
  last_name?: string | null;
  phone_number?: string | null;
  role?: UserRole;
  gender?: GenderType | null;
  avatar_image_id?: string | null;
}

// Update an existing user
export async function updateUser(id: string, payload: UpdateUserPayload): Promise<IUser> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('user')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null)
    .select(USER_SELECT_QUERY)
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('User not found or failed to update.')
  return mapRawUserToIUser(data) as IUser;
}

// Soft delete a user (deactivate)
export async function deactivateUser(id: string): Promise<IUser> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('user')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select(USER_SELECT_QUERY)
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('User not found or failed to deactivate.')
  return mapRawUserToIUser(data) as IUser;
}

// Restore a soft-deleted user (reactivate)
export async function reactivateUser(id: string): Promise<IUser> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('user')
    .update({ deleted_at: null, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(USER_SELECT_QUERY)
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('User not found or failed to reactivate.')
  return mapRawUserToIUser(data) as IUser;
}

// Function to ensure user exists in the public.user table after auth actions (e.g. signup)
// This is often called client-side after signup, or server-side in a hook/trigger.
// For server-side actions, it's better if a DB trigger handles this.
// If called from server action, it implies an auth user already exists.
export async function ensureServerAuthUserHasPublicProfile(): Promise<IUser | null> {
  const supabase = await createClient();
  
  const { data: { user: authUser } , error: authError } = await supabase.auth.getUser();
  if (authError || !authUser) {
    console.error('No authenticated user found to ensure profile exists.', authError);
    return null;
  }
  
  const { data: publicUser, error: fetchError } = await supabase
    .from('user')
    .select(USER_SELECT_QUERY)
    .eq('auth_user_id', authUser.id)
    .maybeSingle();
    
  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: no rows found, which is fine
    console.error('Error fetching public user profile:', fetchError);
    throw fetchError;
  }

  if (publicUser) {
    return mapRawUserToIUser(publicUser) as IUser; // User already exists
  }

  // User doesn't exist in public.user table, create it
  const newUserPayload: Partial<IUser> = {
    auth_user_id: authUser.id,
    role: UserRole.CLIENT, // Default role
    // email can be part of authUser.email if needed here, though usually not stored in public.user directly
    // first_name, last_name could be populated from authUser.user_metadata if available
  };
  if (authUser.email) {
    // If you decide to store email or parts of it for easier display (not recommended for PII duplication)
    // newUserPayload.email = authUser.email; // Example, not in current IUser
  }
  if (authUser.user_metadata) {
    newUserPayload.first_name = authUser.user_metadata.first_name || authUser.user_metadata.name?.split(' ')[0];
    newUserPayload.last_name = authUser.user_metadata.last_name || authUser.user_metadata.name?.split(' ').slice(1).join(' ');
  }

  const { data: createdUser, error: createError } = await supabase
    .from('user')
    .insert(newUserPayload)
    .select(USER_SELECT_QUERY)
    .single();

  if (createError) {
    console.error('Error creating public user profile:', createError);
    throw createError;
  }
  if (!createdUser) throw new Error('Failed to create and fetch public user profile.')
  return mapRawUserToIUser(createdUser) as IUser;
}
