
import { NextResponse, type NextRequest } from 'next/server';
import { handleTelegramMessage } from '@/ai/flows/andromeda-flow';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Extrai os dados relevantes da mensagem do Telegram
    const message = body.message || body.edited_message;
    if (!message || !message.text || !message.chat?.id) {
      console.log("Webhook do Telegram recebido, mas sem mensagem de texto ou chat ID. Ignorando.", body);
      // Retornar um 200 OK para o Telegram saber que recebemos, mesmo que não atuemos.
      return NextResponse.json({ status: 'ok', message: 'Webhook received but no action taken.' });
    }
    
    const chatId = message.chat.id;
    const userMessage = message.text;

    // Chama o fluxo da Andromeda para processar a mensagem
    const andromedaResponse = await handleTelegramMessage({
        chatId: chatId,
        message: userMessage,
    });
    
    // Retorna a resposta da Andromeda diretamente no corpo da resposta para o Telegram
    // Isso é mais eficiente do que fazer uma segunda chamada fetch.
    return NextResponse.json({
        method: 'sendMessage',
        chat_id: chatId,
        text: andromedaResponse.text,
        reply_markup: andromedaResponse.reply_markup,
        parse_mode: 'Markdown'
    });

  } catch (error: any) {
    console.error('Erro no processamento do webhook do Telegram:', error);
    // Em caso de erro, é importante ainda retornar uma resposta 200 OK para o Telegram
    // para evitar que ele tente reenviar a mesma mensagem repetidamente.
    // O erro já está logado no servidor para depuração.
    return NextResponse.json({ status: 'error processing message' }, { status: 200 });
  }
}

// O Telegram pode enviar uma requisição GET para verificar o webhook
export async function GET(req: NextRequest) {
    return NextResponse.json({ status: 'ok', message: 'Webhook está ativo e pronto para receber POSTs.' });
}
