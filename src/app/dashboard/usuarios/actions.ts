
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

  // Forçar a URL de redirecionamento completa e correta.
  // Isso sobrepõe qualquer configuração no painel do Supabase, garantindo que o link funcione.
  const redirectTo = process.env.NODE_ENV === 'production' 
    ? 'https://bifrost-agenda.netlify.app/sign-up' 
    : 'http://localhost:9003/sign-up';

  const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name: name,
    },
    redirectTo: redirectTo,
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
    // Pré-criar o perfil com o status 'pending'
    // O upsert é a abordagem correta para evitar erros se o perfil já existir de alguma forma.
    // O erro que o usuário está vendo é quase certamente de RLS.
    // O código aqui está correto, mas a mensagem de erro pode ser mais específica.
     const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: inviteData.user.id,
        name: name,
        email: email,
        role: 'Asgard', // Cargo padrão
        status: 'pending', // Marcar como pendente
        permissions: {}, // Inicia com permissões vazias
      }, { onConflict: 'id' });
    
    if (profileError) {
        console.error("Error during profile upsert for invited user:", profileError);
        // Opcional: deletar o usuário convidado se a criação do perfil falhar para evitar inconsistências.
        await supabaseAdmin.auth.admin.deleteUser(inviteData.user.id);
        const specificErrorMessage = profileError.message.includes('violates row-level security policy')
            ? "O convite falhou pois a política de segurança do banco de dados (RLS) na tabela 'profiles' impediu a criação do perfil. Verifique as permissões de INSERT no Supabase."
            : `O convite falhou pois não foi possível criar o perfil do usuário: ${profileError.message}`;

        return { data: null, error: { message: specificErrorMessage } };
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
