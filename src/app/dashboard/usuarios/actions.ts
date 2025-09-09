
'use server'

import { createClient } from '@supabase/supabase-js'

export async function deleteUser(userId: string) {
  // Initialize the admin client inside the function
  // to ensure environment variables are loaded at runtime.
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  
  if (error) {
    console.error('Error deleting user:', error)
    return { error: error.message }
  }

  return { error: null }
}
