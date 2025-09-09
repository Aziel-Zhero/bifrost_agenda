
'use server';

import { supabase } from "@/lib/supabase/client";

export async function signUpUser(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password) {
        return { error: { message: "Nome, email e senha são obrigatórios." }};
    }
    
    // O trigger no Supabase irá criar o perfil automaticamente.
    // Para isso, precisamos passar o nome do usuário nos metadados (options.data)
    // que o trigger irá usar para popular a tabela 'profiles'.
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,
            }
        }
    });

    if (error) {
        console.error("Sign up error:", error);
        return { error };
    }

    if (!data.user) {
        return { error: { message: "Usuário não foi criado no sistema de autenticação." }};
    }
    
    // O trigger cuida da criação do perfil. Não precisamos inserir em 'profiles' manualmente.
    
    return { data: data.user };
}
