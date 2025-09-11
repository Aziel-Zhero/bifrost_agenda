
'use server'

import { createClient } from '@supabase/supabase-js'

export async function createUser({ email, name, password }: { email: string, name: string, password: string }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    const errorMessage = 'Variáveis de ambiente do Supabase (URL ou Service Key) não configuradas no servidor. Adicione SUPABASE_SERVICE_ROLE_KEY ao seu .env.local e reinicie o servidor.';
    console.error(errorMessage);
    return { data: null, error: { message: errorMessage } };
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Automatically confirm the email
    user_metadata: {
      full_name: name,
    },
  });

  if (createError) {
    console.error('Error creating user:', createError);
    return { data: null, error: createError };
  }

  // If user creation is successful, create a profile for them.
  if (createData.user) {
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: createData.user.id,
        name: name,
        email: email,
        role: 'Asgard', // Default role for new users
        permissions: {}, // Default empty permissions
      });

    if (profileError) {
      console.error('Error creating profile for new user:', profileError);
      // We might want to handle this case, e.g., by deleting the auth user if profile creation fails.
      // For now, return the original creation data but log the profile error.
      return { data: createData, error: profileError };
    }
  }

  return { data: createData, error: null };
}


export async function deleteUser(userId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    const errorMessage = 'Variaveis de ambiente do Supabase (URL ou Service Key) não configuradas no servidor. Adicione SUPABASE_SERVICE_ROLE_KEY ao seu .env.local e reinicie o servidor.';
    console.error(errorMessage);
    return { error: { message: errorMessage } };
  }

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

  const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  
  if (error) {
    console.error('Error deleting user:', error)
    return { error }
  }

  return { data, error: null }
}
