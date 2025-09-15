
'use server';

import { createClient } from '@supabase/supabase-js';
import { supabase } from "@/lib/supabase/client";
import { sendTelegramNotification } from "@/services/notification-service";
import { startOfMinute, addMinutes, subMinutes } from 'date-fns';

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
    console.log("Server Action: Received new appointment ID for immediate notification:", appointmentId);
    
    const supabaseAdmin = getSupabaseAdmin();

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

        // Notification for the client, if they have a Telegram Chat ID
        const clientTelegramId = appointment.clients?.telegram;
        if (clientTelegramId) {
             const clientMessage = `Saudações, ${clientName}! ✨\n\nSou a GAIA, e trago notícias dos reinos! Um encontro foi marcado pelos destinos e sua jornada está confirmada.\n\n*Serviço:* ${serviceName}\n*Com:* ${adminName}\n*Quando:* ${dateTime}\n\nAs estrelas aguardam ansiosamente por você!`;
            const { success, message } = await sendTelegramNotification(clientMessage, clientTelegramId);
            await logToDb(clientMessage, `Cliente: ${clientName} (${clientTelegramId})`, success ? 'Enviado' : `Falhou: ${message}`);
            console.log(`Server Action: Client Telegram notification attempt to ${clientTelegramId}. Success: ${success}`);
        }
    }
}


export async function sendTestTelegramMessage(chatId: string): Promise<{ success: boolean; message: string }> {
  const testMessage = `👋 Olá! Esta é uma mensagem de teste da GAIA. Se você recebeu isso, a conexão com o Telegram está funcionando perfeitamente! ✨`;
  
  const result = await sendTelegramNotification(testMessage, chatId);

  const supabaseAdmin = getSupabaseAdmin();

  await supabaseAdmin.from('gaia_logs').insert({
    message_content: testMessage,
    sent_to: `Teste para ID: ${chatId}`,
    status: result.success ? 'Enviado' : `Falhou: ${result.message}`,
  });
  
  return result;
}

export async function sendAppointmentReminders() {
    console.log("Server Action: Checking for appointment reminders to send.");
    const supabaseAdmin = getSupabaseAdmin();
    const now = new Date();
    
    // Check for appointments between 60 and 75 minutes from now.
    // This gives a 15-min window to catch appointments and avoid re-sending.
    const reminderWindowStart = addMinutes(now, 60);
    const reminderWindowEnd = addMinutes(now, 75);

    const { data: appointments, error } = await supabaseAdmin
        .from('appointments')
        .select(`
            id,
            date_time,
            clients (name, telegram),
            services (name),
            profiles (name)
        `)
        .eq('status', 'Agendado')
        .gte('date_time', reminderWindowStart.toISOString())
        .lt('date_time', reminderWindowEnd.toISOString());

    if (error) {
        console.error('Error fetching appointments for reminders:', error);
        return;
    }

    if (!appointments || appointments.length === 0) {
        console.log("Server Action: No appointments found in the upcoming reminder window.");
        return;
    }

    // Get IDs of appointments for which we've already sent reminders
    const appointmentIds = appointments.map(a => a.id);
    const { data: existingReminders, error: reminderError } = await supabaseAdmin
        .from('appointment_reminders')
        .select('appointment_id')
        .in('appointment_id', appointmentIds);

    if (reminderError) {
        console.error('Error checking for existing reminders:', reminderError);
        return;
    }
    const sentReminderIds = new Set(existingReminders?.map(r => r.appointment_id));

    const logToDb = async (message: string, to: string, status: string) => {
        await supabaseAdmin.from('gaia_logs').insert({
            message_content: message,
            sent_to: to,
            status: status,
        });
    };

    for (const appointment of appointments) {
        if (sentReminderIds.has(appointment.id)) {
            continue; // Skip if reminder already sent
        }

        const clientTelegramId = appointment.clients?.telegram;
        if (clientTelegramId) {
            const clientName = appointment.clients?.name || 'Viajante';
            const serviceName = appointment.services?.name || 'Jornada';
            const adminName = appointment.profiles?.name || 'um guardião de Asgard';
            const time = new Date(appointment.date_time).toLocaleTimeString('pt-BR', { timeStyle: 'short' });

            const reminderMessage = `Saudações, nobre ${clientName}! 🌟\n\nA poeira estelar sussurra que seu encontro se aproxima. A GAIA veio lembrá-lo de sua jornada.\n\n*Serviço:* ${serviceName}\n*Com:* ${adminName}\n*Horário:* Hoje, às ${time}\n\nOs reinos aguardam por você. Não se atrase!`;

            const { success, message } = await sendTelegramNotification(reminderMessage, clientTelegramId);

            if (success) {
                // Log success in both tables
                await logToDb(reminderMessage, `Lembrete Cliente: ${clientName} (${clientTelegramId})`, 'Enviado');
                await supabaseAdmin.from('appointment_reminders').insert({ appointment_id: appointment.id, status: 'Sent' });
                console.log(`Server Action: Reminder sent successfully for appointment ${appointment.id}`);
            } else {
                // Log failure
                await logToDb(reminderMessage, `Lembrete Cliente: ${clientName} (${clientTelegramId})`, `Falhou: ${message}`);
                console.log(`Server Action: Failed to send reminder for appointment ${appointment.id}`);
            }
        }
    }
}
