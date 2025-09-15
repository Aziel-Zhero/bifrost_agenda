
/**
 * Service for sending notifications to external platforms like Telegram.
 */

interface NotificationResult {
  success: boolean;
  message: string;
}

export async function sendTelegramNotification(message: string, chatId?: string): Promise<NotificationResult> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const targetChatId = chatId || process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !targetChatId) {
    const errorMsg = "As variáveis de ambiente do Telegram (TELEGRAM_BOT_TOKEN e um TELEGRAM_CHAT_ID) não estão configuradas ou não foi fornecido um ID de chat.";
    console.error(errorMsg);
    return { success: false, message: errorMsg };
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const payload = {
    chat_id: targetChatId,
    text: message,
    parse_mode: 'Markdown',
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!result.ok) {
      console.error('Falha ao enviar notificação para o Telegram:', result.description);
      return { success: false, message: result.description };
    } else {
      console.log(`Notificação do Telegram enviada com sucesso para o chat ID: ${targetChatId}!`);
      return { success: true, message: 'Enviado com sucesso.' };
    }

  } catch (error: any) {
    console.error('Erro de rede ou fetch ao contatar a API do Telegram:', error);
    return { success: false, message: error.message || 'Erro de rede' };
  }
}
