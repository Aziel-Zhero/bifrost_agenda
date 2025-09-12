
'use server'

import { createClient } from '@supabase/supabase-js'
import type { UserProfile } from '@/types';

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
    // This should ideally point to your production URL.
    // For local development, it points to localhost.
    // Ensure you have NEXT_PUBLIC_SITE_URL in your environment variables for production.
    return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9003/sign-up';
}

export async function getUsers(): Promise<{ data: UserProfile[] | null, error: { message: string } | null }> {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
        return { data: null, error: { message: `Falha ao buscar usuários: ${authError.message}` } };
    }

    const { data: profiles, error: profileError } = await supabaseAdmin.from('profiles').select('*');
    if (profileError) {
        return { data: null, error: { message: `Falha ao buscar perfis: ${profileError.message}` } };
    }
    
    const profileMap = new Map(profiles.map(p => [p.id, p]));

    const combinedUsers: UserProfile[] = authData.users.map((authUser: any) => {
      const profile = profileMap.get(authUser.id);
      return {
        id: authUser.id,
        name: profile?.name || authUser.user_metadata?.full_name || 'Nome não definido',
        email: authUser.email || 'Email não encontrado',
        role: profile?.role || 'Asgard',
        avatar: profile?.avatar,
        permissions: profile?.permissions || {},
        last_sign_in_at: authUser.last_sign_in_at,
      };
    });

    return { data: combinedUsers, error: null };
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


export async function updatePermissionsByRole(role: UserProfile['role'], permissions: UserProfile['permissions']) {
    const supabaseAdmin = getSupabaseAdmin();

    // 1. Find all users with the specified role
    const { data: profiles, error: fetchError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('role', role);

    if (fetchError) {
        console.error(`Error fetching users with role ${role}:`, fetchError);
        return { error: { message: `Não foi possível buscar usuários para o papel ${role}.` } };
    }

    if (!profiles || profiles.length === 0) {
        // No users with this role, so nothing to update.
        return { data: { message: 'Nenhum usuário encontrado com este papel.' }, error: null };
    }

    const userIds = profiles.map(p => p.id);

    // 2. Update the permissions for all found users
    const { data, error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ permissions })
        .in('id', userIds)
        .select(); // .select() to get the updated rows back

    if (updateError) {
        console.error(`Error updating permissions for role ${role}:`, updateError);
        return { error: { message: `Falha ao atualizar as permissões: ${updateError.message}` } };
    }

    return { data, error: null };
}
