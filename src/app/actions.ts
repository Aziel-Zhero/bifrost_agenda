
// @/app/actions.ts
'use server';

import { supabase } from "@/lib/supabase/client";

export async function signUpUser(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password) {
        return { error: { message: "Nome, email e senha são obrigatórios." }};
    }
    
    // Auth Supabase client
    // Note: In a real app, you'd want to use a server-side Supabase client for admin operations
    // but for signUp, the client-side one works and handles the flow correctly.
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            // You can add additional data to the user's metadata if needed
            data: {
                full_name: name,
            }
        }
    });

    if (authError) {
        return { error: authError };
    }

    if (!authData.user) {
        return { error: { message: "Usuário não foi criado no sistema de autenticação." }}
    }

    // Now, insert into the public.profiles table
    // The user has been created in auth, but we need to create their profile in our public table.
    const { error: profileError } = await supabase
        .from('profiles')
        .insert({
            id: authData.user.id, // The ID from the authenticated user
            name: name,
            email: email,
            role: 'Midgard', // Assign a default role
            permissions: {} // Default empty permissions
        });
    
    if (profileError) {
        // This is tricky. The user is in auth but not in profiles.
        // For a production app, you might want to have a cleanup process.
        console.error("Error creating profile for user:", authData.user.id, profileError);
        return { error: { message: "O usuário foi autenticado, mas houve um erro ao criar o perfil."}};
    }
    
    return { data: authData.user };
}
