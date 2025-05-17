'use server'

import { createClient } from '@/utils/supabase/server'

export async function signupTest(formData: FormData) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  })

  if (error) {
    console.error(error)
    return { error: error.message }
  }

  return data
}