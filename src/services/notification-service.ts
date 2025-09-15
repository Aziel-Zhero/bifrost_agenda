
/**
 * Service for sending notifications to external platforms like Telegram.
 */

export async function sendTelegramNotification(message: string, chatId?: string): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const targetChatId = chatId || process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !targetChatId) {
    console.error("As variáveis de ambiente do Telegram (TELEGRAM_BOT_TOKEN e um TELEGRAM_CHAT_ID) não estão configuradas ou não foi fornecido um ID de chat.");
    // We don't throw an error here to prevent the main flow from crashing if notifications are not set up.
    // Instead, we log the error and return.
    return;
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
      // Log the error but don't let it crash the main application flow
      console.error('Falha ao enviar notificação para o Telegram:', result.description);
      // We can re-throw if we want the caller to handle it, but for notifications it's often better to fail silently for non-critical notifications.
      // For this case we won't re-throw.
    } else {
      console.log(`Notificação do Telegram enviada com sucesso para o chat ID: ${targetChatId}!`);
    }

  } catch (error) {
    console.error('Erro de rede ou fetch ao contatar a API do Telegram:', error);
     // We don't re-throw here either to keep the main application running.
  }
}
