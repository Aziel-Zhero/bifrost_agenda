
'use server'

import { createClient } from '@supabase/supabase-js'

export async function deleteUser(userId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    const errorMessage = 'Variáveis de ambiente do Supabase não configuradas no servidor.';
    console.error(errorMessage);
    return { error: errorMessage };
  }

  // Initialize the admin client inside the function
  // to ensure environment variables are loaded at runtime.
  const supabaseAdmin = createClient(
    supabaseUrl,
    serviceKey,
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
