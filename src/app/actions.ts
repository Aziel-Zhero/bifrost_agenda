
'use server';

import { createClient } from '@supabase/supabase-js';
import { supabase } from "@/lib/supabase/client";
import { sendTelegramNotification } from "@/services/notification-service";
import { startOfMinute, addMinutes, subMinutes, subDays, startOfDay, endOfDay } from 'date-fns';
import type { Appointment } from '@/types';

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
                role: 'staff' // Default role for new sign-ups
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

const replacePlaceholders = (template: string, replacements: Record<string, string>): string => {
    let result = template;
    for (const key in replacements) {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), replacements[key]);
    }
    return result;
};


export async function notifyOnNewAppointment(appointmentId: string) {
    console.log("Server Action: Received new appointment ID for immediate notification:", appointmentId);
    
    const supabaseAdmin = getSupabaseAdmin();

    const { data: appointment, error } = await supabaseAdmin
        .from('appointments')
        .select(`
            *,
            clients (full_name),
            services (name),
            profiles (full_name)
        `)
        .eq('id', appointmentId)
        .single();
    
    if (error) {
        console.error('Error fetching new appointment details for notification:', error);
        return;
    }
    
    const { data: templates, error: templateError } = await supabaseAdmin
        .from('gaia_message_templates')
        .select('*');

    if (templateError) {
        console.error('Error fetching message templates:', templateError);
        return;
    }

    // Use the admin_id from the appointment to fetch the correct studio profile
    const { data: studioProfile, error: studioProfileError } = await supabaseAdmin
        .from('studio_profile')
        .select('google_maps_url')
        .eq('profile_id', appointment.admin_id)
        .single();

    if (studioProfileError) {
        console.warn('Could not fetch studio profile for placeholders:', studioProfileError.message);
    }


    const logToDb = async (message: string, to: string, status: string) => {
        await supabaseAdmin.from('gaia_logs').insert({
            message_content: message,
            sent_to: to,
            status: status,
        });
    };

    if (appointment) {
        const replacements = {
            clientName: appointment.clients?.full_name || 'Viajante',
            serviceName: appointment.services?.name || 'Jornada',
            adminName: appointment.profiles?.full_name || 'um guardião de Asgard',
            dateTime: new Date(appointment.date_time).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short'}),
            time: new Date(appointment.date_time).toLocaleTimeString('pt-BR', { timeStyle: 'short' }),
            googleMapsUrl: studioProfile?.google_maps_url || 'https://maps.google.com'
        };

        const studioChatId = process.env.TELEGRAM_CHAT_ID;
        const studioTemplate = templates?.find(t => t.event_type === 'new_appointment_studio');

        // Notification for the admin/studio group
        if (studioChatId && studioTemplate && studioTemplate.is_enabled) {
            const studioMessage = replacePlaceholders(studioTemplate.template, replacements);
            const { success, message } = await sendTelegramNotification(studioMessage, studioChatId);
            await logToDb(studioMessage, `Grupo do Studio (${studioChatId})`, success ? 'Enviado' : `Falhou: ${message}`);
            console.log(`Server Action: Studio Telegram notification attempt. Success: ${success}`);
        }

        // Logic for client notification (e.g. via email or another service)
        // This part needs to be adapted based on how you store client contact info for Telegram
        // For now, it's commented out as `telegram` is not in the `clients` table schema.
        /*
        const clientTelegramId = appointment.clients?.telegram;
        const clientTemplate = templates?.find(t => t.event_type === 'new_appointment_client');
        if (clientTelegramId && clientTemplate && clientTemplate.is_enabled) {
            const clientMessage = replacePlaceholders(clientTemplate.template, replacements);
            const { success, message } = await sendTelegramNotification(clientMessage, clientTelegramId);
            await logToDb(clientMessage, `Cliente: ${replacements.clientName} (${clientTelegramId})`, success ? 'Enviado' : `Falhou: ${message}`);
            console.log(`Server Action: Client Telegram notification attempt to ${clientTelegramId}. Success: ${success}`);
        }
        */
    }
}


export async function sendTestTemplateMessage(template: string, chatId: string, userId: string): Promise<{ success: boolean; message: string }> {
     const supabaseAdmin = getSupabaseAdmin();
     const { data: studioProfile, error: studioProfileError } = await supabaseAdmin
        .from('studio_profile')
        .select('google_maps_url')
        .eq('profile_id', userId)
        .single();
    
    if (studioProfileError) {
        console.warn('Could not fetch studio profile for test message placeholders:', studioProfileError.message);
    }

    const testReplacements = {
        clientName: 'Cliente de Teste',
        serviceName: 'Jornada de Teste',
        adminName: 'Guardião de Teste',
        dateTime: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short'}),
        time: new Date().toLocaleTimeString('pt-BR', { timeStyle: 'short' }),
        googleMapsUrl: studioProfile?.google_maps_url || 'https://maps.google.com/?q=brazil'
    };

    const testMessage = `*--- MENSAGEM DE TESTE DA GAIA ---*\n\n${replacePlaceholders(template, testReplacements)}`;

    const result = await sendTelegramNotification(testMessage, chatId);

    await supabaseAdmin.from('gaia_logs').insert({
        message_content: testMessage,
        sent_to: `Teste para ID: ${chatId}`,
        status: result.success ? 'Enviado' : `Falhou: ${result.message}`,
    });

    return result;
}

// NOTE: The reminder and evaluation logic needs significant updates
// to work with the new schema, especially for fetching client contact details.
// These are placeholder functions for now.

export async function sendAppointmentReminders() {
    console.log("Server Action: Checking for appointment reminders to send (Logic needs update for new schema).");
}

export async function sendEvaluationMessages() {
    console.log("Server Action: Checking for post-appointment evaluations to send (Logic needs update for new schema).");
}

    