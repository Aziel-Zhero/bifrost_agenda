
'use server'

import { createClient } from '@supabase/supabase-js'

export async function inviteUser({ email, name }: { email: string, name: string }) {
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

  const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name: name,
    },
    redirectTo: '/sign-up',
  });

  if (inviteError) {
    console.error('Error inviting user:', inviteError);
     let toastDescription = "Ocorreu um erro inesperado. Tente novamente.";
      if (inviteError.message.includes("User already registered")) {
          toastDescription = "Este e-mail já está em uso ou foi convidado. Por favor, utilize outro endereço.";
      }
    return { data: null, error: { message: toastDescription } };
  }

  if (inviteData.user) {
    // Pre-create the profile with a 'pending' status
     const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: inviteData.user.id,
        name: name,
        email: email,
        role: 'Asgard', // Default role
        status: 'pending', // Mark as pending
        permissions: {},
      });
    
    if (profileError) {
        console.error("Error creating profile for invited user:", profileError);
        // We might need to handle this, e.g., by deleting the invited user if profile creation fails.
        // For now, we log the error.
        return { data: null, error: { message: "O convite foi enviado, mas houve um erro ao criar o perfil do usuário." } };
    }
  }


  return { data: inviteData, error: null };
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
