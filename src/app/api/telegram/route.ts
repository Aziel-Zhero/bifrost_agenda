
import { NextResponse, type NextRequest } from 'next/server';
import { handleTelegramMessage } from '@/ai/flows/andromeda-flow';
import { sendTelegramNotification } from '@/services/notification-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Extrai os dados relevantes da mensagem do Telegram
    const message = body.message || body.edited_message;
    if (!message || !message.text || !message.chat?.id) {
      console.log("Webhook do Telegram recebido, mas sem mensagem de texto ou chat ID. Ignorando.", body);
      return NextResponse.json({ status: 'ok', message: 'Webhook received but no action taken.' });
    }
    
    const chatId = message.chat.id;
    const userMessage = message.text;

    // Chama o fluxo da Andromeda para processar a mensagem
    const andromedaResponse = await handleTelegramMessage({
        chatId: chatId,
        message: userMessage,
    });
    
    // Envia a resposta da Andromeda de volta para o usuário no Telegram
    // Precisamos de uma função de envio que aceite 'reply_markup'
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
        throw new Error('TELEGRAM_BOT_TOKEN não configurado.');
    }
    
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const payload = {
        chat_id: chatId,
        text: andromedaResponse.text,
        reply_markup: andromedaResponse.reply_markup,
        parse_mode: 'Markdown'
    };

    const telegramApiResponse = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    const telegramResult = await telegramApiResponse.json();

    if (!telegramResult.ok) {
        console.error('Falha ao enviar resposta do bot para o Telegram:', telegramResult.description);
        // Não lançamos um erro aqui para não falhar a resposta do webhook
    }

    return NextResponse.json({ status: 'ok' });

  } catch (error: any) {
    console.error('Erro no processamento do webhook do Telegram:', error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

// O Telegram pode enviar uma requisição GET para verificar o webhook
export async function GET(req: NextRequest) {
    return NextResponse.json({ status: 'ok', message: 'Webhook está ativo e pronto para receber POSTs.' });
}
