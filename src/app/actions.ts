
'use server';

import { supabase } from "@/lib/supabase/client";
import { sendTelegramNotification } from "@/services/notification-service";
import type { Appointment, Service, Client } from "@/types";

export async function signUpUser(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password) {
        return { error: { message: "Nome, email e senha são obrigatórios." }};
    }
    
    // The Supabase trigger will create the profile automatically.
    // To ensure the role is set, we pass it in the metadata.
    // The trigger should be configured to read `raw_user_meta_data->>'role'`
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,
                role: 'Asgard' // Default role for new sign-ups
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
    
    // The trigger handles profile creation, and we've included the role in the metadata.
    // If the trigger isn't set up to handle the role, we might need to update it here,
    // but for now, we rely on the trigger.
    
    return { data: data.user };
}


export async function notifyOnNewAppointment(appointmentId: string) {
    console.log("Server Action: Received new appointment ID:", appointmentId);

    // Fetch appointment details to create a rich notification message.
    // Note: We use the service role key here to bypass RLS if needed, assuming this action is secure.
     const { data: appointment, error } = await supabase
        .from('appointments')
        .select(`
            *,
            clients (name),
            services (name),
            profiles (name)
        `)
        .eq('id', appointmentId)
        .single();
    
    if (error) {
        console.error('Error fetching new appointment details for notification:', error);
        return;
    }

    if (appointment) {
        const clientName = appointment.clients?.name || 'Cliente desconhecido';
        const serviceName = appointment.services?.name || 'Serviço não especificado';
        const adminName = appointment.profiles?.name || 'Admin';
        const dateTime = new Date(appointment.date_time).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short'});

        const message = `🗓️ *Novo Agendamento!* 🗓️\n\n*Profissional:* ${adminName}\n*Cliente:* ${clientName}\n*Serviço:* ${serviceName}\n*Quando:* ${dateTime}\n\nUm novo cliente foi agendado na agenda geral.`;

        try {
            await sendTelegramNotification(message);
            console.log("Server Action: Telegram notification sent successfully.");
        } catch (e: any) {
            console.error("Server Action: Failed to send Telegram notification:", e.message);
        }
    }
}
