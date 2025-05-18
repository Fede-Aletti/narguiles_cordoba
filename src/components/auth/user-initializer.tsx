'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export function UserInitializer() {
  const router = useRouter()
  
  useEffect(() => {
    const ensureUserExists = async () => {
      const supabase = createClient()
      
      // Get session
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData?.session?.user) return
      
      // Check if user exists
      const { data: user, error } = await supabase
        .from('user')
        .select('id')
        .eq('auth_user_id', sessionData.session.user.id)
        .single()
        
      // Create user if doesn't exist
      if (error && !user) {
        await supabase
          .from('user')
          .insert({
            auth_user_id: sessionData.session.user.id,
            role: 'client'
          })
          
        // Refresh the page to ensure everything is up to date
        router.refresh()
      }
    }
    
    ensureUserExists()
  }, [router])
  
  // This component doesn't render anything
  return null
} 