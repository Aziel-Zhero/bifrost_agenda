
/**
 * Service for sending notifications to external platforms like Telegram.
 */

export async function sendTelegramNotification(message: string): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    throw new Error("As variáveis de ambiente do Telegram (TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID) não estão configuradas.");
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const payload = {
    chat_id: chatId,
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
      // We can re-throw if we want the caller to handle it, but for notifications it's often better to fail silently.
      throw new Error(`Telegram API Error: ${result.description}`);
    }

    console.log('Notificação do Telegram enviada com sucesso!');
  } catch (error) {
    console.error('Erro de rede ou fetch ao contatar a API do Telegram:', error);
    // Re-throw to allow the caller to know something went wrong
    throw error;
  }
}
