
'use server'

import { createClient } from '@supabase/supabase-js'
import type { UserProfile, AuditLog, Role } from '@/types';

// This maps the UI-facing mythological roles to the database-level technical roles.
const roleMap: Record<Role, 'owner' | 'admin' | 'staff'> = {
    Bifrost: 'owner',
    Heimdall: 'admin',
    Asgard: 'staff',
    Midgard: 'staff',
};

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
      const dbRole = profile?.role || 'staff';
      
      // Reverse map the database role to the UI role for display
      const uiRole: Role = (Object.keys(roleMap) as Role[]).find(key => roleMap[key] === dbRole) || 'Asgard';

      return {
        id: authUser.id,
        full_name: profile?.full_name || authUser.user_metadata?.full_name || 'Nome não definido',
        email: authUser.email || 'Email não encontrado',
        role: uiRole,
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
        full_name: name,
        email: email,
        role: 'staff', // Default role for new users is always 'staff'
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
  
  const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  
  if (error) {
    console.error('Error deleting user:', error);
    return { error };
  }

  return { data, error: null };
}


export async function updatePermissionsByRole(role: Role, permissions: UserProfile['permissions']) {
    const supabaseAdmin = getSupabaseAdmin();
    
    const dbRole = roleMap[role];
    if (!dbRole) {
        return { error: { message: `Papel mitológico '${role}' não reconhecido.` } };
    }

    // 1. Find all users with the specified database role
    const { data: profiles, error: fetchError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('role', dbRole);

    if (fetchError) {
        console.error(`Error fetching users with role ${role} (db: ${dbRole}):`, fetchError);
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


export async function getAuditLogs(): Promise<{ data: AuditLog[] | null, error: { message: string } | null }> {
    const supabaseAdmin = getSupabaseAdmin();

    // The `supabase_audit.record_events` table contains the audit trail.
    const { data, error } = await supabaseAdmin
        .schema('supabase_audit')
        .from('record_events') 
        .select('id, payload, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching audit logs:", error);
        return { data: null, error: { message: "Falha ao buscar logs de auditoria: " + error.message }};
    }
    
    // The payload comes as a JSON object, but the timestamp needs to be a Date object.
    const logs: AuditLog[] = data.map((log: any) => {
        let message = log.payload?.action ? `Action: ${log.payload.action}` : 'Ação desconhecida';
        let record = {};

        // Customize message for specific actions
        if (log.payload?.action === 'auth.user_deleted') {
            message = 'User deleted';
            record = { email: log.payload.record_data?.email, id: log.payload.record_id };
        }

        return {
            id: log.id,
            payload: {
                message: message,
                record: record,
            },
            timestamp: new Date(log.created_at)
        }
    });

    return { data: logs, error: null };
}
