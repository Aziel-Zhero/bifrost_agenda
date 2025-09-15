
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
            clients (name, telegram),
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

        // Notification for the admin/studio group
        const studioMessage = `🗓️ *Novo Agendamento!* 🗓️\n\n*Profissional:* ${adminName}\n*Cliente:* ${clientName}\n*Serviço:* ${serviceName}\n*Quando:* ${dateTime}\n\nUm novo cliente foi agendado na agenda geral.`;

        try {
            // The TELEGRAM_CHAT_ID in .env should be for the studio's group
            await sendTelegramNotification(studioMessage, process.env.TELEGRAM_CHAT_ID);
            console.log("Server Action: Studio Telegram notification sent successfully.");
        } catch (e: any) {
            console.error("Server Action: Failed to send studio Telegram notification:", e.message);
        }

        // Notification for the client, if they have a Telegram ID
        const clientTelegramId = appointment.clients?.telegram;
        if (clientTelegramId) {
             const clientMessage = `Olá, ${clientName}! ✨\n\nSeu agendamento foi *confirmado* com sucesso!\n\n*Serviço:* ${serviceName}\n*Profissional:* ${adminName}\n*Quando:* ${dateTime}\n\nMal podemos esperar para te ver!`;
             try {
                await sendTelegramNotification(clientMessage, clientTelegramId);
                console.log(`Server Action: Client Telegram notification sent successfully to ID ${clientTelegramId}.`);
            } catch (e: any)
             {
                console.error(`Server Action: Failed to send client Telegram notification to ID ${clientTelegramId}:`, e.message);
            }
        }
    }
}
