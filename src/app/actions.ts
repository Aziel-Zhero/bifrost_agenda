
'use server';

import { createClient } from '@supabase/supabase-js';
import { supabase } from "@/lib/supabase/client";
import { sendTelegramNotification } from "@/services/notification-service";

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
    const { data, error } = supabase.auth.signUp({
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
    
    // We need a client instance on the server to interact with the DB
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch appointment details to create a rich notification message.
     const { data: appointment, error } = await supabaseAdmin
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

    const logToDb = async (message: string, to: string, status: string) => {
        await supabaseAdmin.from('gaia_logs').insert({
            message_content: message,
            sent_to: to,
            status: status,
        });
    };

    if (appointment) {
        const clientName = appointment.clients?.name || 'Viajante';
        const serviceName = appointment.services?.name || 'Jornada';
        const adminName = appointment.profiles?.name || 'um guardião de Asgard';
        const dateTime = new Date(appointment.date_time).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short'});
        const studioChatId = process.env.TELEGRAM_CHAT_ID;

        // Notification for the admin/studio group with a mythological tone
        const studioMessage = `🛡️ *Pelos corvos de Odin!* 🛡️\n\nUm novo destino foi traçado na Grande Agenda. A Bifrost se abre para um novo encontro.\n\n*Profissional:* ${adminName}\n*Viajante:* ${clientName}\n*Jornada:* ${serviceName}\n*Quando:* ${dateTime}\n\nQue os Deuses guiem este momento!`;

        if (studioChatId) {
            const { success, message } = await sendTelegramNotification(studioMessage, studioChatId);
            await logToDb(studioMessage, `Grupo do Studio (${studioChatId})`, success ? 'Enviado' : `Falhou: ${message}`);
            console.log(`Server Action: Studio Telegram notification attempt. Success: ${success}`);
        }

        // Notification for the client, if they have a Telegram ID
        const clientTelegramId = appointment.clients?.telegram;
        if (clientTelegramId) {
             const clientMessage = `Saudações, ${clientName}! ✨\n\nSou a GAIA, e trago notícias dos reinos! Um encontro foi marcado pelos destinos e sua jornada está confirmada.\n\n*Serviço:* ${serviceName}\n*Com:* ${adminName}\n*Quando:* ${dateTime}\n\nAs estrelas aguardam ansiosamente por você!`;
            const { success, message } = await sendTelegramNotification(clientMessage, clientTelegramId);
            await logToDb(clientMessage, `${clientName} (${clientTelegramId})`, success ? 'Enviado' : `Falhou: ${message}`);
            console.log(`Server Action: Client Telegram notification attempt to ${clientTelegramId}. Success: ${success}`);
        }
    }
}
