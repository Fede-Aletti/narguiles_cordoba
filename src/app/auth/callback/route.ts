import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
    
    // After authentication, get the user ID
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      // Check if user record exists
      const { data: user, error } = await supabase
        .from('user')
        .select('id')
        .eq('auth_user_id', session.user.id)
        .single()
        
      // Create user if doesn't exist
      if (error && !user) {
        await supabase
          .from('user')
          .insert({
            auth_user_id: session.user.id,
            role: 'client'
          })
      }
    }
  }

  return NextResponse.redirect(requestUrl.origin)
} 