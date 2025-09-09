
'use server';

import { supabase } from "@/lib/supabase/client";

export async function signUpUser(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password) {
        return { error: { message: "Nome, email e senha são obrigatórios." }};
    }
    
    // The trigger in Supabase will automatically create the profile.
    // We only need to handle the auth signup here.
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                // This data is passed to the JWT and can be used by the trigger.
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
    
    // The trigger handles profile creation. We don't need to insert into 'profiles' manually.
    
    return { data: data.user };
}
