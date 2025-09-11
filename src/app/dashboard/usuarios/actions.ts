
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

  // 1. Create the user in the auth schema
  const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: name,
    },
  });

  if (createError) {
    console.error('Error creating user:', createError);
    return { data: null, error: createError };
  }

  // 2. The trigger on `auth.users` automatically creates a profile in `public.profiles`.
  // Instead of inserting, we now UPDATE the profile that the trigger created.
  if (createData.user) {
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        role: 'Asgard', // Set the default role
        permissions: {}, // Set default empty permissions
      })
      .eq('id', createData.user.id); // Find the profile by the new user's ID

    if (profileError) {
      console.error('Error updating profile for new user:', profileError);
      // Even if the profile update fails, the user was created.
      // The role can be assigned manually later.
      // We return the user creation data but log the profile error.
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
