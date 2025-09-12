
'use server'

import { createClient } from '@supabase/supabase-js'

const getSupabaseAdmin = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
        throw new Error('Variáveis de ambiente do Supabase (URL ou Service Key) não configuradas no servidor.');
    }

    return createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
}

const getRedirectToUrl = () => {
    return process.env.NODE_ENV === 'production' 
        ? 'https://bifrost-agenda.netlify.app/sign-up' 
        : 'http://localhost:9003/sign-up';
}

export async function inviteUser({ email, name }: { email: string, name: string }) {
  const supabaseAdmin = getSupabaseAdmin();
  
  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name: name,
    },
    redirectTo: getRedirectToUrl(),
  });

  if (error) {
    console.error('Error inviting user:', error);
    let toastDescription = "Ocorreu um erro inesperado. Tente novamente.";
      if (error.message.includes("User already registered")) {
          toastDescription = "Este e-mail já está em uso ou foi convidado. Por favor, utilize outro endereço.";
      }
    return { data: null, error: { message: toastDescription } };
  }

  if (data.user) {
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: data.user.id,
        name: name,
        email: email,
        role: 'Asgard', // Default role for new users
      }, { onConflict: 'id' });
    
    if (profileError) {
        console.error("Error during profile upsert for invited user:", profileError);
        // If profile creation fails, we should delete the auth user to allow a clean retry.
        await supabaseAdmin.auth.admin.deleteUser(data.user.id);
        const specificErrorMessage = `O convite falhou pois não foi possível criar o perfil do usuário: ${profileError.message}`;
        return { data: null, error: { message: specificErrorMessage } };
    }
  }

  return { data, error: null };
}

export async function reinviteUser(userId: string) {
    const supabaseAdmin = getSupabaseAdmin();
    
    // First, get the user's email
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userError || !user.user.email) {
        console.error("Error fetching user for reinvite:", userError);
        return { error: { message: "Não foi possível encontrar o usuário para reenviar o convite." } };
    }

    // Now, send a new invite. Supabase handles this as a re-invitation.
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(user.user.email, {
        redirectTo: getRedirectToUrl(),
    });

    if (error) {
        console.error("Error re-inviting user:", error);
        return { error: { message: `Falha ao reenviar convite: ${error.message}` } };
    }

    return { data, error: null };
}


export async function deleteUser(userId: string) {
  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  
  if (error) {
    console.error('Error deleting user:', error)
    return { error }
  }

  return { data, error: null }
}
