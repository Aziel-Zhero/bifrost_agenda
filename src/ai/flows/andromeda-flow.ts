
'use server';
/**
 * @fileOverview O cérebro da GAIA (Andromeda), responsável por processar
 * as mensagens recebidas via webhook do Telegram, consultar os gatilhos e
 * retornar as respostas adequadas.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import type { AndromedaTrigger, StudioProfile } from '@/types';

// Define o schema de entrada para o fluxo (o que recebemos do Telegram)
const HandleTelegramMessageInputSchema = z.object({
  chatId: z.number().describe('O ID do chat do Telegram de onde a mensagem veio.'),
  message: z.string().describe('O texto da mensagem enviada pelo usuário.'),
});
export type HandleTelegramMessageInput = z.infer<typeof HandleTelegramMessageInputSchema>;

// Define o schema de saída do fluxo (o que enviaremos de volta para o Telegram)
const TelegramMessageOutputSchema = z.object({
  text: z.string().describe('O texto da mensagem de resposta.'),
  reply_markup: z.any().optional().describe('Um objeto JSON para botões interativos (inline_keyboard).'),
});
export type TelegramMessageOutput = z.infer<typeof TelegramMessageOutputSchema>;


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

/**
 * Função principal que é exportada e chamada pelo nosso endpoint da API.
 * Ela invoca o fluxo Genkit com a entrada recebida.
 */
export async function handleTelegramMessage(input: HandleTelegramMessageInput): Promise<TelegramMessageOutput> {
  return andromedaFlow(input);
}


// O fluxo principal da Andromeda
const andromedaFlow = ai.defineFlow(
  {
    name: 'andromedaFlow',
    inputSchema: HandleTelegramMessageInputSchema,
    outputSchema: TelegramMessageOutputSchema,
  },
  async (input) => {
    const supabase = getSupabaseAdmin();
    const userMessage = input.message.toLowerCase().trim();

    // 1. Busca todos os gatilhos ativos da tabela 'andromeda'
    const { data: triggers, error: triggerError } = await supabase
      .from('andromeda')
      .select('*')
      .eq('is_enabled', true);

    if (triggerError) {
      console.error('Erro ao buscar gatilhos da Andromeda:', triggerError);
      return { text: 'Desculpe, estou com dificuldade para acessar minhas memórias cósmicas. Tente novamente mais tarde.' };
    }

    // 2. Encontra o primeiro gatilho que corresponde à mensagem do usuário
    const matchedTrigger = triggers.find((trigger: AndromedaTrigger) =>
      trigger.trigger_keywords.some(keyword => userMessage.includes(keyword.toLowerCase()))
    );

    // Se nenhum gatilho for encontrado, retorna uma mensagem padrão
    if (!matchedTrigger) {
      return { text: 'Não compreendi seu comando, nobre viajante. Poderia tentar com outras palavras?' };
    }

    // 3. Processa a resposta com base no tipo de ação do gatilho
    let responseText = matchedTrigger.response_text;
    let replyMarkup;

    // Ação para buscar localização
    if (matchedTrigger.action_type === 'ask_location') {
        const { data: profile, error: profileError } = await supabase
            .from('studio_profile')
            .select('google_maps_url, address_street, address_number, address_neighborhood, address_city, address_state')
            .eq('id', 1)
            .single();
        
        if (profileError || !profile) {
             return { text: 'Não encontrei as coordenadas do nosso reino no momento.' };
        }

        // Se tiver URL do Google Maps, usa para o botão
        if (profile.google_maps_url && matchedTrigger.response_buttons) {
            const buttons = matchedTrigger.response_buttons.map((btn: any) => ({
                ...btn,
                url: btn.url.replace('{{googleMapsUrl}}', profile.google_maps_url)
            }));
            replyMarkup = { inline_keyboard: [buttons] };
        } 
        // Senão, monta o endereço em texto e adiciona à resposta
        else {
            const addressParts = [
                profile.address_street,
                profile.address_number,
                profile.address_neighborhood,
                profile.address_city,
                profile.address_state
            ].filter(Boolean); // Filtra partes vazias

            if (addressParts.length > 0) {
                 responseText += `\n\nNosso endereço é: ${addressParts.join(', ')}.`;
            } else {
                 responseText = "Não encontrei as informações de endereço do estúdio. Por favor, configure na área de Perfil do Studio.";
            }
        }
    }

    // Ação de saudação (pode ter botões ou não)
    if (matchedTrigger.action_type === 'greeting' && matchedTrigger.response_buttons) {
        replyMarkup = { inline_keyboard: [matchedTrigger.response_buttons] };
    }
    
    // TODO: Implementar a lógica para 'ask_appointment'
    if (matchedTrigger.action_type === 'ask_appointment') {
        // Esta lógica será mais complexa. Por enquanto, só retorna o texto.
        // Próximos passos: buscar o cliente pelo chat_id, depois buscar agendamentos.
    }


    // 4. Retorna a resposta final formatada
    return {
      text: responseText,
      reply_markup: replyMarkup,
    };
  }
);
