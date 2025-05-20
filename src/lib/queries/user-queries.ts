import { createClient } from '@/utils/supabase/client'; // Use client-side Supabase client
import type { IUser } from '@/interfaces/user';
import type { IMediaItem } from '@/interfaces/media';
import type { UserWithAuthEmail } from '@/actions/user-actions'; // Can reuse this type

// Copied and adapted from user-actions.ts for client-side usage
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

export async function fetchClientSideUsers(): Promise<UserWithAuthEmail[]> {
  const supabase = createClient(); // Client-side client

  const { data: users, error: usersError } = await supabase
    .from('user')
    .select(USER_SELECT_QUERY)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (usersError) throw new Error(usersError.message);
  if (!users) return [];

  const authUserIds = users.map(u => u.auth_user_id);
  // Fetching auth.users might be problematic client-side if RLS is restrictive
  // or if you want to avoid exposing all auth user IDs. 
  // Consider if this part is truly needed client-side or if the admin role implies access.
  // For now, replicating server logic.
  const { data: authUsers, error: authError } = await supabase
    .from('auth.users') // This might need specific RLS if called client-side by non-admin
    .select('id, email')
    .in('id', authUserIds);

  if (authError) {
    console.warn("Could not fetch auth user emails from client-side query:", authError.message);
    // Depending on requirements, you might throw error or proceed without emails
  }

  const authEmailMap = new Map(authUsers?.map(au => [au.id, au.email]));

  return users.map(user => mapRawUserToIUser(user, authEmailMap.get(user.auth_user_id)));
} 