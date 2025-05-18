import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // Check if the user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  // If authenticated, ensure user exists in public.user table
  if (session?.user) {
    // First check if user record exists
    const { data: user, error } = await supabase
      .from('user')
      .select('id')
      .eq('auth_user_id', session.user.id)
      .single()
      
    // If user doesn't exist, create it
    if (error && !user) {
      await supabase
        .from('user')
        .insert({
          auth_user_id: session.user.id,
          role: 'client' // Default role
        })
    }
  }
  
  return res
}

// Only run on website routes, not API routes
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
