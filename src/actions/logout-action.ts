'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function logout() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error logging out:', error)
    // Podrías redirigir a una página de error o manejarlo de otra forma
    redirect('/error?message=Could not log out')
  }

  // Invalida el path para asegurar que los datos del usuario se limpien de la caché
  revalidatePath('/', 'layout')
  redirect('/') // Redirige al usuario a la página principal o a la de login
} 